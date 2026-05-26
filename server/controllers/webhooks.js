// server/controllers/webhooks.js
import { Webhook } from "svix";
import stripe from "stripe";
import User from "../models/User.js";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";

// 📧 Email utils
import { sendEmail } from "../utils/sendEmail.js";
import { purchaseSuccessTemplate } from "../utils/emailTemplates.js";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

/* =======================================================
   CLERK WEBHOOKS — USER SYNC
======================================================= */
export const clerkWebhooks = async (req, res) => {
  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await wh.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    const email = data.email_addresses?.[0]?.email_address || "";
    const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();
    const imageUrl = data.image_url || "";
    const role = data.public_metadata?.role || "student";

    if (type === "user.created") {
      await User.create({
        _id: data.id,
        email,
        name,
        imageUrl,
        role,
        enrolledCourses: [],
      });
    }

    if (type === "user.updated") {
      await User.findByIdAndUpdate(data.id, {
        email,
        name,
        imageUrl,
        role,
      });
    }

    if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Clerk Webhook Error:", error.message);
    return res.status(400).json({ success: false });
  }
};

/* =======================================================
   STRIPE WEBHOOKS — PAYMENT → ENROLL → EMAIL
======================================================= */
export const stripeWebhooks = async (req, res) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe Signature Verification Failed:", err.message);
    return res.status(400).send("Webhook Error");
  }

  console.log("⚡ Stripe Event:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const purchaseId = session.metadata?.purchaseId;
    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;

    if (!purchaseId || !courseId || !userId) {
      console.warn("⚠ Missing Stripe metadata");
      return res.status(200).json({ received: true });
    }

    try {
      const purchase = await Purchase.findById(purchaseId);
      if (!purchase || purchase.status === "completed") {
        return res.status(200).json({ received: true });
      }

      const user = await User.findById(userId);
      const course = await Course.findById(courseId);

      if (!user || !course) {
        console.warn("⚠ User or Course not found");
        return res.status(200).json({ received: true });
      }

      // ✅ STEP 1: Mark purchase completed FIRST
      purchase.status = "completed";
      await purchase.save();

      // ✅ STEP 2: Enroll user safely (FIXED ObjectId comparison)
      const alreadyEnrolled = user.enrolledCourses.some(
        (id) => id.toString() === courseId
      );

      if (!alreadyEnrolled) {
        user.enrolledCourses.push(courseId);
        await user.save();
      }

      // ✅ STEP 3: Add student to course safely
      const alreadyStudent = course.enrolledStudents.some(
        (id) => id.toString() === userId
      );

      if (!alreadyStudent) {
        course.enrolledStudents.push(userId);
        await course.save();
      }

      console.log(
        `🎉 Enrollment success: ${user.email} → ${course.courseTitle}`
      );

      // 📧 SEND CONFIRMATION EMAIL
      await sendEmail({
        to: user.email,
        subject: "🎉 Course Purchase Successful | Edemy",
        html: purchaseSuccessTemplate({
          name: user.name,
          courseTitle: course.courseTitle,
          amount: session.amount_total / 100,
        }),
      });

      console.log(`📧 Purchase email SENT SUCCESSFULLY`);
    } catch (error) {
      console.error("❌ Stripe Webhook Processing Error:", error);
    }
  }

  return res.status(200).json({ received: true });
};
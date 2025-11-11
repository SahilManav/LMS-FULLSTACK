// controllers/webhooks.js
import { Webhook } from "svix";
import User from "../models/User.js";
import stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

// ------------------ Clerk Webhooks ------------------
export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    if (type === "user.created") {
      await User.create({
        _id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        imageUrl: data.image_url,
      });
    } else if (type === "user.updated") {
      await User.findByIdAndUpdate(
        data.id,
        {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          imageUrl: data.image_url,
        },
        { new: true }
      );
    } else if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Clerk Webhook Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ------------------ Stripe Webhooks ------------------
export const stripeWebhooks = async (req, res) => {
  let event;

  try {
    // Stripe signature verification using raw body
    const sig = req.headers["stripe-signature"];
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`✅ Stripe Event Received: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { purchaseId } = session.metadata || {};

    if (!purchaseId) {
      console.warn("⚠️ No purchaseId in metadata");
      return res.status(200).json({ success: true });
    }

    try {
      const purchase = await Purchase.findById(purchaseId);
      if (!purchase) {
        console.warn("⚠️ Purchase not found:", purchaseId);
        return res.status(200).json({ success: true });
      }

      if (purchase.status === "completed") {
        console.log("ℹ️ Purchase already completed");
        return res.status(200).json({ success: true });
      }

      const user = await User.findById(purchase.userId);
      const course = await Course.findById(purchase.courseId);

      if (!user || !course) {
        console.warn("⚠️ User or Course not found for purchase:", purchaseId);
        return res.status(200).json({ success: true });
      }

      // ✅ Enroll user safely (no duplicates)
      if (!user.enrolledCourses.includes(course._id.toString())) {
        user.enrolledCourses.push(course._id);
        await user.save();
      }

      if (!course.enrolledStudents.includes(user._id.toString())) {
        course.enrolledStudents.push(user._id);
        await course.save();
      }

      purchase.status = "completed";
      await purchase.save();

      console.log(`🎉 Enrollment successful: ${user.name} → ${course.courseTitle}`);
    } catch (error) {
      console.error("❌ Error processing Stripe webhook:", error);
    }
  }

  res.status(200).json({ received: true });
};

// server/controllers/userController.js

import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";
import stripePkg from "stripe";

const Stripe = stripePkg;

/* =======================================================
   ✅ GET USER DATA
======================================================= */
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findById(userId).populate({
      path: "enrolledCourses",
      select:
        "courseTitle thumbnail courseThumbnail duration discount coursePrice category educator",
      populate: { path: "educator", select: "name email" },
    });

    if (!user) return res.json({ success: false, message: "User Not Found" });

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   🔥 MULTI-COURSE PURCHASE (FIXED)
======================================================= */
export const purchaseCourse = async (req, res) => {
  try {
    const { cart, courseIds } = req.body;
    const origin = req.headers.origin || req.headers.referer || "";
    const userId = req.auth.userId;

    let courses = [];

    // ✅ HANDLE BOTH FRONTEND TYPES
    if (cart && cart.length > 0) {
      courses = cart;
    } else if (courseIds && courseIds.length > 0) {
      const fetchedCourses = await Course.find({
        _id: { $in: courseIds },
      });

      courses = fetchedCourses;
    }

    if (!courses || courses.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }

    let totalAmount = 0;

    const ids = courses.map((item) => {
      const price = Number(item.coursePrice || 0);
      const discount = Number(item.discount || 0);

      const finalPrice = price - (discount * price) / 100;
      totalAmount += finalPrice;

      return item._id;
    });

    // ✅ CREATE PURCHASE
    const purchase = await Purchase.create({
      courses: ids,
      userId,
      amount: totalAmount,
      status: "pending",
    });

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    // ✅ IMPROVED STRIPE CHECKOUT ITEMS
    const line_items = courses.map((course) => {
      const price = Number(course.coursePrice || 0);
      const discount = Number(course.discount || 0);

      const finalPrice =
        price - (discount * price) / 100;

      const image =
        course.thumbnail ||
        course.courseThumbnail ||
        "https://cdn-icons-png.flaticon.com/512/4076/4076549.png";

      return {
        quantity: 1,
        price_data: {
          currency: "usd",

          product_data: {
            name: course.courseTitle,

            description:
              `📚 Category: ${course.category || "Programming"}
⏱ Duration: ${course.duration || "Self Paced"}
🏆 Certificate Included
♾ Lifetime Access
⭐ Premium Course`,

            images: [image],
          },

          unit_amount: Math.round(
            finalPrice * 100
          ),
        },
      };
    });
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/payment-success?purchaseId=${purchase._id}`,
      cancel_url: `${origin}/cart`,
      mode: "payment",
      line_items,
      metadata: {
        purchaseId: purchase._id.toString(),
        userId: userId.toString(),
      },
    });

    res.json({
      success: true,
      session_url: session.url,
    });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   🔥 COMPLETE PURCHASE
======================================================= */
export const completePurchase = async (req, res) => {
  try {
    const { purchaseId } = req.body;
    const userId = req.auth.userId;

    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
      return res.json({ success: false, message: "Purchase not found" });
    }

    purchase.status = "completed";
    await purchase.save();

    await User.updateOne(
      { _id: userId },
      { $addToSet: { enrolledCourses: { $each: purchase.courses } } }
    );

    await Course.updateMany(
      { _id: { $in: purchase.courses } },
      { $addToSet: { enrolledStudents: userId } }
    );

    res.json({ success: true });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   ✅ GET USER ENROLLED COURSES (UPDATED)
======================================================= */
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findById(userId).populate({
      path: "enrolledCourses",
      // 🔥 Include courseContent so lecture count works
      select:
        "courseTitle courseDescription thumbnail coursePrice discount category duration educator courseContent",

      populate: {
        path: "educator",
        select: "name email",
      },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const enrolledCourses = await Promise.all(
      user.enrolledCourses.map(async (course) => {
        const progress =
          await CourseProgress.findOne({
            userId,
            courseId: course._id.toString(),
          });

        // Total lectures
        const totalLectures =
          course.courseContent?.reduce(
            (sum, chapter) =>
              sum +
              (chapter?.chapterContent?.length || 0),
            0
          ) || 0;

        // Completed lectures
        const completedLectures =
          progress?.lectureCompleted || [];

        // Progress %
        const progressPercentage =
          totalLectures > 0
            ? Math.floor(
                (completedLectures.length /
                  totalLectures) *
                  100
              )
            : 0;

        return {
          ...course.toObject(),

          totalLectures,
          completedLectures,
          progress: progressPercentage,
        };
      })
    );

    return res.json({
      success: true,
      enrolledCourses,
      hiddenCourses:
        user.hiddenCourses || [],
    });

  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================================================
   🔥 HIDE COURSE
======================================================= */
export const hideCourse = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.body;

    const user = await User.findById(userId);

    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.hiddenCourses.includes(courseId)) {
      user.hiddenCourses.push(courseId);
    }

    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   🔥 UNHIDE COURSE
======================================================= */
export const unhideCourse = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.body;

    const user = await User.findById(userId);

    if (!user) return res.json({ success: false, message: "User not found" });

    user.hiddenCourses = user.hiddenCourses.filter(
      (id) => id.toString() !== courseId
    );

    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   ✅ UPDATE COURSE PROGRESS
======================================================= */
export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, lectureId } = req.body;

    let progress = await CourseProgress.findOne({ userId, courseId });

    if (progress) {
      if (progress.lectureCompleted.includes(lectureId))
        return res.json({ success: true });

      progress.lectureCompleted.push(lectureId);
      await progress.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   ⭐ REMOVE ENROLLMENT
======================================================= */
export const removeEnrollment = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const courseId = req.params.courseId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { enrolledCourses: courseId } },
      { new: true }
    );

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   ⭐ REMOVE EDUCATOR ROLE
======================================================= */
export const removeEducatorRole = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const updated = await User.findByIdAndUpdate(
      userId,
      { role: "student" },
      { new: true }
    );

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: "student" },
    });

    res.json({ success: true, user: updated });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
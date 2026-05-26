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
   ✅ PURCHASE COURSE (FIXED)
======================================================= */
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const origin = req.headers.origin || req.headers.referer || "";
    const userId = req.auth.userId;

    if (!courseId)
      return res.json({ success: false, message: "Missing courseId" });

    const courseData = await Course.findById(courseId);
    const userData = await User.findById(userId);

    if (!courseData || !userData)
      return res.json({ success: false, message: "Data not found" });

    const priceNum = Number(courseData.coursePrice || 0);
    const discountPercent = Number(courseData.discount || 0);

    const net = Number(
      (priceNum - (discountPercent * priceNum) / 100).toFixed(2)
    );

    // Check existing pending purchase
    const existingPending = await Purchase.findOne({
      courseId: courseData._id,
      userId,
      status: "pending",
    });

    if (existingPending) {
      existingPending.amount = net;
      await existingPending.save();
    }

    const newPurchase =
      existingPending ||
      (await Purchase.create({
        courseId: courseData._id,
        userId,
        amount: net,
        status: "pending",
      }));

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    // ⭐ FIXED — include courseId in success URL
    const session = await stripeInstance.checkout.sessions.create({
      success_url:
        `${origin}/payment-success?purchaseId=${newPurchase._id.toString()}&courseId=${courseData._id.toString()}`,
      cancel_url:
        `${origin}/payment-cancel?purchaseId=${newPurchase._id.toString()}`,
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: courseData.courseTitle,
              description: courseData.courseDescription?.slice(0, 100),
            },
            unit_amount: Math.round(net * 100),
          },
        },
      ],
      metadata: {
        purchaseId: newPurchase._id.toString(),
        courseId: courseData._id.toString(),
        userId: userId.toString(),
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   ✅ GET USER ENROLLED COURSES
======================================================= */
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findById(userId).populate({
      path: "enrolledCourses",
      select:
        "courseTitle thumbnail courseThumbnail duration discount coursePrice category educator",
      populate: { path: "educator", select: "name email" },
    });

    if (!user) return res.json({ success: false, message: "User not found" });

    res.json({ success: true, enrolledCourses: user.enrolledCourses });
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

    if (!courseId || !lectureId)
      return res.json({
        success: false,
        message: "Missing courseId or lectureId",
      });

    let progress = await CourseProgress.findOne({ userId, courseId });

    if (progress) {
      if (progress.lectureCompleted.includes(lectureId))
        return res.json({ success: true, message: "Already Completed" });

      progress.lectureCompleted.push(lectureId);
      await progress.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.json({ success: true, message: "Progress Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   ✅ GET COURSE PROGRESS
======================================================= */
export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.body;

    const progressData = await CourseProgress.findOne({ userId, courseId });

    res.json({ success: true, progressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   ⭐ ADD COURSE RATING
======================================================= */
export const addUserRating = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.json({ success: false, message: "Invalid rating" });

    const course = await Course.findById(courseId);
    if (!course)
      return res.json({ success: false, message: "Course not found" });

    const user = await User.findById(userId);
    if (!user)
      return res.json({ success: false, message: "User not found" });

    const isEnrolled = user.enrolledCourses
      .map((c) => c.toString())
      .includes(courseId.toString());

    if (!isEnrolled)
      return res.json({ success: false, message: "Not enrolled" });

    const existing = course.courseRatings.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existing > -1) course.courseRatings[existing].rating = rating;
    else course.courseRatings.push({ userId, rating });

    await course.save();

    res.json({ success: true, message: "Rating saved" });
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

    if (!courseId)
      return res.json({ success: false, message: "Missing Course ID" });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { enrolledCourses: courseId } },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Enrollment removed successfully!",
      user: updatedUser,
    });
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

    return res.json({
      success: true,
      message: "You switched back to Student successfully.",
      user: updated,
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

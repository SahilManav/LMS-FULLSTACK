// server/controllers/educatorController.js

import { v2 as cloudinary } from "cloudinary";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

/* =======================================================
   ⭐ Thumbnail Helper
======================================================= */
const getThumbnail = (course) =>
  course.thumbnail ||
  course.courseThumbnail ||
  "https://cdn-icons-png.flaticon.com/512/4076/4076549.png";

/* =======================================================
   ⭐ UPDATE ROLE → EDUCATOR
======================================================= */
export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: "educator" },
    });

    await User.findByIdAndUpdate(
      userId,
      { role: "educator" },
      { new: true }
    );

    res.json({
      success: true,
      message: "You are now an educator! You can publish courses.",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   ⭐ ADD NEW COURSE
======================================================= */
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;

    if (!courseData) {
      return res.status(400).json({
        success: false,
        message: "Missing courseData",
      });
    }

    const parsed = JSON.parse(courseData);

    let thumb = "";
    if (req.file) {
      thumb =
        req.file.path ||
        req.file.secure_url ||
        req.file.url ||
        req.file.filename ||
        "";
    }

    if (!thumb && parsed.courseThumbnail) thumb = parsed.courseThumbnail;

    const educatorId = req.auth?.userId;
    if (!educatorId)
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    const newCourse = await Course.create({
      ...parsed,
      educator: educatorId,
      courseThumbnail: thumb,
    });

    res.status(201).json({
      success: true,
      message: "Course added successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ⭐ GET EDUCATOR COURSES (Fixed Format for Frontend)
======================================================= */
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;

    const courses = await Course.find({ educator })
      .select([
        "courseTitle",
        "thumbnail",
        "courseThumbnail",
        "coursePrice",
        "discount",
        "category",
        "level",
        "language",
        "duration",
        "enrolledStudents",
        "createdAt",
      ])
      .lean();

    const formatted = courses.map((c) => ({
      ...c,
      totalStudents: c.enrolledStudents?.length || 0,
      earnings:
        (c.enrolledStudents?.length || 0) *
        (c.coursePrice - (c.discount || 0)),
      effectiveThumbnail: getThumbnail(c),
    }));

    res.json({ success: true, courses: formatted });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   ⭐ EDUCATOR DASHBOARD (Earnings + Students)
======================================================= */
export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;

    const courses = await Course.find({ educator });
    const courseIds = courses.map((c) => c._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const totalEarnings = purchases.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const enrolledStudentsData = purchases.map((p) => ({
      student: p.userId,
      courseTitle: p.courseId.courseTitle,
      purchaseDate: p.createdAt,
    }));

    res.json({
      success: true,
      dashboardData: {
        totalCourses: courses.length,
        totalEarnings,
        enrolledStudentsData,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   ⭐ STUDENTS ENROLLED TABLE
======================================================= */
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;

    const courses = await Course.find({ educator });
    const courseIds = courses.map((c) => c._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((p) => ({
      student: p.userId,
      courseTitle: p.courseId.courseTitle,
      purchaseDate: p.createdAt,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* =======================================================
   ⭐ DELETE COURSE (Fixed)
======================================================= */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const educatorId = req.auth?.userId;

    const course = await Course.findById(id);
    if (!course)
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });

    if (String(course.educator) !== String(educatorId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this course",
      });
    }

    await Course.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

import Course from "../models/Course.js";
import cloudinary from "cloudinary";
import { Purchase } from "../models/Purchase.js";

// ============================================================
// ⭐ ADD COURSE (FULL FIXED VERSION)
// ============================================================
export const addCourse = async (req, res) => {
  try {
    if (!req.body.courseData) {
      return res.status(400).json({
        success: false,
        message: "courseData is missing",
      });
    }

    const parsed = JSON.parse(req.body.courseData);

    if (!parsed.courseTitle || !parsed.courseDescription) {
      return res.status(400).json({
        success: false,
        message: "Course title & description are required",
      });
    }

    if (!req.auth?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const educatorId = req.auth.userId;

    // -------------------------------------------
    // UPLOAD THUMBNAIL
    // -------------------------------------------
    let thumbnailUrl = null;
    if (req.file) {
      const uploaded = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "edemy/courses",
      });
      thumbnailUrl = uploaded.secure_url;
    }

    // -------------------------------------------
    // PROCESS CHAPTERS + LECTURES
    // -------------------------------------------
    const processedContent = (parsed.courseContent || []).map((chapter) => ({
      chapterId: chapter.chapterId,
      chapterOrder: chapter.chapterOrder,
      chapterTitle: chapter.chapterTitle,
      chapterContent: chapter.chapterContent?.map((lec) => ({
        lectureId: lec.lectureId,
        lectureTitle: lec.lectureTitle,
        lectureDuration: lec.lectureDuration,
        lectureUrl: lec.lectureUrl,       // ⭐ VERY IMPORTANT
        isPreviewFree: lec.isPreviewFree,
        lectureOrder: lec.lectureOrder,
      })) || [],
    }));

    // -------------------------------------------
    // CREATE COURSE
    // -------------------------------------------
    const newCourse = new Course({
      courseTitle: parsed.courseTitle,
      courseDescription: parsed.courseDescription,
      coursePrice: parsed.coursePrice,
      discount: parsed.discount || 0,
      category: parsed.category,
      language: parsed.language,
      level: parsed.level,
      duration: parsed.duration,
      requirements: parsed.requirements,
      whatYouWillLearn: parsed.whatYouWillLearn,

      courseContent: processedContent,      // ⭐ SAVING CONTENT CORRECTLY

      educator: educatorId,
      thumbnail: thumbnailUrl,              // ⭐ CLOUDINARY THUMBNAIL
    });

    await newCourse.save();

    return res.json({
      success: true,
      message: "Course created successfully",
      course: newCourse,
    });

  } catch (err) {
    console.error("❌ Add Course Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};


// ============================================================
// ⭐ GET ALL COURSES CREATED BY EDUCATOR
// ============================================================
export const getMyCourses = async (req, res) => {
  try {
    const educatorId = req.auth.userId;

    const courses = await Course.find({ educator: educatorId })
      .sort({ createdAt: -1 })
      .lean();

    const courseIds = courses.map((c) => c._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    }).select(["courseId", "amount"]);

    const earningsMap = {};
    purchases.forEach((p) => {
      const id = p.courseId.toString();
      earningsMap[id] = (earningsMap[id] || 0) + p.amount;
    });

    const coursesWithComputed = courses.map((c) => ({
      ...c,
      earnings: earningsMap[c._id.toString()] || 0,
      totalStudents: c.enrolledStudents?.length || 0,
      effectiveThumbnail: c.thumbnail, // FIXED
    }));

    res.json({ success: true, courses: coursesWithComputed });
  } catch (err) {
    console.error("❌ Error fetching educator courses:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

// ============================================================
// ⭐ DELETE COURSE
// ============================================================
export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const educatorId = req.auth.userId;

    const course = await Course.findOne({
      _id: courseId,
      educator: educatorId,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or unauthorized",
      });
    }

    await Course.findByIdAndDelete(courseId);

    return res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

import express from "express";
import { CourseProgress } from "../models/CourseProgress.js";
import Course from "../models/Course.js";

const router = express.Router();

/* ==========================================
   MARK LECTURE COMPLETE
========================================== */
router.post("/complete", async (req, res) => {
  try {
    const { userId, courseId, lectureId } = req.body;

    if (!userId || !courseId || !lectureId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let progress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        lectureCompleted: [],
        progressPercentage: 0,
        timeSpent: 0,
        completed: false,
      });
    }

    const exists =
      progress.lectureCompleted.some(
        (lecture) =>
          lecture.lectureId === lectureId
      );

    if (!exists) {
      progress.lectureCompleted.push({
        lectureId,
        completedAt: new Date(),
      });
    }

    const course =
      await Course.findById(courseId).lean();

    const totalLectures =
      course?.courseContent?.reduce(
        (sum, chapter) =>
          sum +
          (chapter.chapterContent?.length || 0),
        0
      ) || 0;

    const percentage =
      totalLectures > 0
        ? Math.floor(
            (progress.lectureCompleted.length /
              totalLectures) *
              100
          )
        : 0;

    progress.progressPercentage =
      percentage;

    progress.completed =
      percentage >= 100;

    await progress.save();

    return res.json({
      success: true,
      progressPercentage:
        progress.progressPercentage,
      completed:
        progress.completed,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* ==========================================
   GET PROGRESS
========================================== */
router.get("/:userId/:courseId", async (req, res) => {
  try {
    const { userId, courseId } =
      req.params;

    const progress =
      await CourseProgress.findOne({
        userId,
        courseId,
      });

    if (!progress) {
      return res.json({
        success: true,
        progressPercentage: 0,
        lectureCompleted: [],
        completed: false,
        timeSpent: 0,
      });
    }

    return res.json({
      success: true,
      progressPercentage:
        progress.progressPercentage || 0,
      lectureCompleted:
        progress.lectureCompleted || [],
      completed:
        progress.completed || false,
      timeSpent:
        progress.timeSpent || 0,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* ==========================================
   UPDATE TIME SPENT
========================================== */
router.post("/time", async (req, res) => {
  try {
    const {
      userId,
      courseId,
      minutes,
    } = req.body;

    let progress =
      await CourseProgress.findOne({
        userId,
        courseId,
      });

    if (!progress) {
      progress =
        await CourseProgress.create({
          userId,
          courseId,
          lectureCompleted: [],
          progressPercentage: 0,
          timeSpent: 0,
          completed: false,
        });
    }

    progress.timeSpent +=
      Number(minutes || 0);

    await progress.save();

    return res.json({
      success: true,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
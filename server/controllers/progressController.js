import { CourseProgress } from "../models/CourseProgress.js";
import Course from "../models/Course.js";

/* ==========================================
   GET COURSE PROGRESS
========================================== */
export const getCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const progress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (!progress) {
      return res.json({
        progressPercentage: 0,
        completed: false,
        lectureCompleted: [],
      });
    }

    const course = await Course.findById(
      courseId
    ).lean();

    const totalLectures =
      course?.courseContent?.reduce(
        (sum, chapter) =>
          sum +
          (chapter.chapterContent?.length || 0),
        0
      ) || 0;

    const completedCount =
      progress.lectureCompleted.length;

    const percentage =
      totalLectures > 0
        ? Math.floor(
            (completedCount / totalLectures) *
              100
          )
        : 0;

    progress.progressPercentage =
      percentage;

    progress.completed =
      percentage === 100;

    await progress.save();

    return res.json({
      progressPercentage: percentage,
      completed: progress.completed,
      lectureCompleted:
        progress.lectureCompleted,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch progress",
    });
  }
};

/* ==========================================
   MARK LECTURE COMPLETE
========================================== */
export const markLectureComplete = async (
  req,
  res
) => {
  try {
    const { userId, courseId } =
      req.params;

    const { lectureId } = req.body;

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
        });
    }

    // FIXED OBJECT CHECK
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
      await Course.findById(
        courseId
      ).lean();

    const totalLectures =
      course?.courseContent?.reduce(
        (sum, chapter) =>
          sum +
          (chapter.chapterContent?.length || 0),
        0
      ) || 0;

    progress.progressPercentage =
      totalLectures > 0
        ? Math.floor(
            (progress.lectureCompleted
              .length /
              totalLectures) *
              100
          )
        : 0;

    progress.completed =
      progress.progressPercentage ===
      100;

    await progress.save();

    res.json({
      success: true,
      progressPercentage:
        progress.progressPercentage,
      completed:
        progress.completed,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Failed to update progress",
    });
  }
};
// server/controllers/courseController.js
import Course from "../models/Course.js";
import User from "../models/User.js";

/* =======================================================
   ⭐ Helper: Return correct thumbnail (FIXED ONLY THIS)
======================================================= */
const getThumbnail = (course) => {
  if (course.thumbnail && course.thumbnail.startsWith("http")) {
    return course.thumbnail;
  }

  if (course.courseThumbnail && course.courseThumbnail.startsWith("http")) {
    return course.courseThumbnail;
  }

  // support local uploads
  if (course.courseThumbnail) {
    return `http://localhost:5000/${course.courseThumbnail}`;
  }

  return "https://cdn-icons-png.flaticon.com/512/4076/4076549.png";
};

/* =======================================================
   ⭐ GET ALL COURSES (PUBLIC LIST)
======================================================= */
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
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
        "courseRatings",
        "courseContent",
        "educator",
      ])
      .populate({
        path: "educator",
        select: "name email imageUrl",
      })
      .lean();

    const formatted = courses.map((c) => ({
      ...c,
      effectiveThumbnail: getThumbnail(c),
      rating: Array.isArray(c.courseRatings)
        ? Math.round(
            c.courseRatings.reduce((s, r) => s + r.rating, 0) /
              (c.courseRatings.length || 1)
          )
        : 0,
      lectures:
        c.courseContent?.reduce(
          (sum, ch) => sum + (ch.chapterContent?.length || 0),
          0
        ) || 0,
    }));

    return res.json({ success: true, courses: formatted });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching courses: " + error.message,
    });
  }
};

/* =======================================================
   ⭐ GET COURSE DETAILS (Before Enrollment)
======================================================= */
export const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId)
      .select([
        "courseTitle",
        "courseDescription",
        "thumbnail",
        "courseThumbnail",
        "coursePrice",
        "discount",
        "category",
        "level",
        "language",
        "duration",
        "courseRatings",
        "courseContent",
        "educator",
      ])
      .populate({
        path: "educator",
        select: "name email imageUrl",
      })
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    course.courseContent?.forEach((chapter) => {
      chapter.chapterContent?.forEach((lecture) => {
        if (!lecture.isPreviewFree) lecture.lectureUrl = "";
      });
    });

    course.effectiveThumbnail = getThumbnail(course);

    return res.json({ success: true, courseData: course });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching course: " + error.message,
    });
  }
};

/* =======================================================
   ⭐ GET MY ENROLLED COURSES
======================================================= */
export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user?._id || req.auth?.userId;

    const courses = await Course.find({
      enrolledStudents: userId,
    })
      .select([
        "courseTitle",
        "thumbnail",
        "courseThumbnail",
        "courseContent",
        "duration",
        "discount",
        "coursePrice",
        "courseRatings",
        "enrolledStudents",
      ])
      .lean();

    const formatted = courses.map((c) => ({
      ...c,
      effectiveThumbnail: getThumbnail(c),
    }));

    return res.json({ success: true, courses: formatted });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching enrolled courses: " + error.message,
    });
  }
};

/* =======================================================
   ⭐ GET COURSE FOR PLAYER
======================================================= */
export const getCourseForPlayer = async (req, res) => {
  try {
    const userId = String(req.auth?.userId);
    const courseId = String(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No valid user",
      });
    }

    const [course, user] = await Promise.all([
      Course.findById(courseId)
        .select([
          "courseTitle",
          "courseDescription",
          "thumbnail",
          "courseThumbnail",
          "coursePrice",
          "discount",
          "category",
          "level",
          "language",
          "duration",
          "courseRatings",
          "courseContent",
          "enrolledStudents",
          "educator",
        ])
        .populate({
          path: "educator",
          select: "name email imageUrl",
        })
        .lean(),
      User.findById(userId).select("enrolledCourses").lean(),
    ]);

    if (!course)
      return res.status(404).json({ success: false, message: "Course not found" });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const enrolledIds = (course.enrolledStudents || []).map((id) =>
      String(id)
    );
    const userCourseIds = (user.enrolledCourses || []).map((id) =>
      String(id)
    );

    const inCourseArray = enrolledIds.includes(userId);
    const inUserArray = userCourseIds.includes(courseId);

    const isEnrolled = inCourseArray || inUserArray;

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    const updates = [];
    if (!inCourseArray) {
      updates.push(
        Course.updateOne(
          { _id: courseId },
          { $addToSet: { enrolledStudents: userId } }
        )
      );
    }
    if (!inUserArray) {
      updates.push(
        User.updateOne(
          { _id: userId },
          { $addToSet: { enrolledCourses: courseId } }
        )
      );
    }
    if (updates.length) {
      await Promise.all(updates);
    }

    course.effectiveThumbnail = getThumbnail(course);

    return res.json({
      success: true,
      courseData: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error loading course: " + error.message,
    });
  }
};

/* =======================================================
   ⭐ ENROLL COURSE
======================================================= */
export const enrollCourse = async (req, res) => {
  try {
    const userId = String(req.user?._id || req.auth?.userId);
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });

    const enrolledIds = (course.enrolledStudents || []).map(String);

    if (enrolledIds.includes(userId)) {
      return res.json({ success: true, message: "Already enrolled" });
    }

    course.enrolledStudents.push(userId);
    await course.save();

    await User.updateOne(
      { _id: userId },
      { $addToSet: { enrolledCourses: courseId } }
    );

    return res.json({
      success: true,
      message: "Enrolled successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to enroll: " + error.message,
    });
  }
};

/* =======================================================
   ⭐ RATE COURSE
======================================================= */
export const rateCourse = async (req, res) => {
  try {
    const { rating } = req.body;
    const userId = String(req.user?._id || req.auth?.userId);
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });

    const existing = course.courseRatings.find(
      (r) => String(r.userId) === userId
    );

    if (existing) {
      existing.rating = rating;
    } else {
      course.courseRatings.push({ userId, rating });
    }

    await course.save();

    return res.json({
      success: true,
      message: "Rating submitted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error rating course: " + error.message,
    });
  }
};

/* =======================================================
   ⭐ EDUCATOR COURSES
======================================================= */
export const getEducatorCourses = async (req, res) => {
  try {
    const educatorId = req.user?._id || req.auth?.userId;

    const courses = await Course.find({ educator: educatorId })
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

    return res.json({
      success: true,
      courses: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching educator courses: " + error.message,
    });
  }
};

/* =======================================================
   ⭐ DELETE COURSE
======================================================= */
export const deleteCourse = async (req, res) => {
  try {
    const educatorId = req.user?._id || req.auth?.userId;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (String(course.educator) !== String(educatorId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You cannot delete this course",
      });
    }

    // Delete course
    await Course.deleteOne({ _id: courseId });

    // 🔥 Remove deleted course from users
    await User.updateMany(
      {},
      {
        $pull: {
          enrolledCourses: courseId,
        },
      }
    );

    // 🔥 If all courses gone → reset leaderboard stats
    const remainingCourses =
      await Course.countDocuments();

    if (remainingCourses === 0) {
      await User.updateMany(
        {},
        {
          $set: {
            score: 0,
            coursesCompleted: 0,
            enrolledCourses: [],
          },
        }
      );
    }

    return res.json({
      success: true,
      message: "Course deleted successfully",
      refreshLeaderboard: true,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Error deleting course: " +
        error.message,
    });
  }
};
import Classroom from "../models/Classroom.js";
import { nanoid } from "nanoid";

/* ======================================================
HELPER: GET USER INFO (🔥 FINAL FIX FOR CLERK)
====================================================== */
const getUserInfo = (req) => {
  const claims = req.auth?.sessionClaims || {};

  const name =
    claims.name ||
    `${claims.firstName || ""} ${claims.lastName || ""}`.trim() ||
    claims.username ||
    "Student";

  const email =
    claims.emailAddress ||
    claims.email ||
    claims.primaryEmailAddress?.emailAddress ||
    claims.email_addresses?.[0]?.email_address ||
    "";

  return { name, email };
};

/* ======================================================
CREATE CLASSROOM
====================================================== */
export const createClassroom = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false });
    }

    const { title, courseId } = req.body;

    const classroom = await Classroom.create({
      title,
      instructor: userId,
      joinCode: nanoid(6).toUpperCase(),
      students: [],
      courses: courseId ? [{ courseId }] : [],
      liveClasses: [],
      assignments: [],
      attendance: [],
      quizzes: [],
      quizAttempts: [],
    });

    res.status(201).json({ success: true, classroom });
  } catch (error) {
    console.error("CREATE CLASSROOM ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
DELETE CLASSROOM
====================================================== */
export const deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ success: false });
    }

    await classroom.deleteOne();

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
GET MY CLASSROOMS
====================================================== */
export const getMyClassrooms = async (req, res) => {
  try {
    const userId = req.user?._id;

    const classrooms = await Classroom.find({
      $or: [{ instructor: userId }, { "students.user": userId }],
    });

    res.json({ success: true, classrooms });
  } catch (error) {
    console.error("GET MY CLASSROOMS ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
GET MY CREATED CLASSROOMS
====================================================== */
export const getMyCreatedClassrooms = async (req, res) => {
  try {
    const userId = req.user?._id;

    const classrooms = await Classroom.find({
      instructor: userId,
    });

    res.json({ success: true, classrooms });
  } catch (error) {
    console.error("GET CREATED ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
JOIN CLASSROOM
====================================================== */
export const joinClassroom = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user?._id;

    const { name, email } = getUserInfo(req);

    const classroom = await Classroom.findOne({
      joinCode: code.toUpperCase(),
    });

    if (!classroom) {
      return res.status(404).json({ success: false });
    }

    const already = classroom.students.some(
      (s) => String(s.user) === String(userId)
    );

    if (!already) {
      classroom.students.push({
        user: userId,
        name,
        email,
      });

      await classroom.save();
    }

    res.json({ success: true, classroom });
  } catch (error) {
    console.error("JOIN ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
MARK SELF ATTENDANCE
====================================================== */
export const markSelfAttendance = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { name } = getUserInfo(req);

    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ success: false });
    }

    const today = new Date().toDateString();

    let todayRecord = classroom.attendance.find(
      (a) => new Date(a.date).toDateString() === today
    );

    if (!todayRecord) {
      todayRecord = {
        date: new Date(),
        records: [],
      };
      classroom.attendance.push(todayRecord);
    }

    const already = todayRecord.records.find(
      (r) => String(r.student) === String(userId)
    );

    if (!already) {
      todayRecord.records.push({
        student: userId,
        name,
        status: "present",
      });
    }

    await classroom.save();

    res.json({ success: true });
  } catch (error) {
    console.error("ATTENDANCE ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
CREATE QUIZ
====================================================== */
export const createQuiz = async (req, res) => {
  try {
    const { title, questions } = req.body;

    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ success: false });
    }

    classroom.quizzes.push({ title, questions });

    await classroom.save();

    res.json({ success: true });
  } catch (error) {
    console.error("QUIZ ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
SUBMIT QUIZ
====================================================== */
export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { quizIndex, answers } = req.body;

    const userId = req.user?._id;
    const { name, email } = getUserInfo(req);

    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ success: false });
    }

    const already = classroom.quizAttempts.find(
      (a) =>
        a.quizIndex === quizIndex &&
        String(a.student) === String(userId)
    );

    if (already) {
      return res.status(400).json({ success: false });
    }

    const quiz = classroom.quizzes[quizIndex];

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    classroom.quizAttempts.push({
      quizIndex,
      student: userId,
      name,
      email,
      answers,
      score,
    });

    await classroom.save();

    res.json({
      success: true,
      score,
      total: quiz.questions.length,
    });
  } catch (error) {
    console.error("SUBMIT QUIZ ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
LEADERBOARD
====================================================== */
export const getLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    const { quizIndex } = req.query;

    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ success: false });
    }

    const leaderboard = classroom.quizAttempts
      .filter((a) => a.quizIndex == quizIndex)
      .sort((a, b) => b.score - a.score);

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error("LEADERBOARD ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
GET CLASSROOM
====================================================== */
export const getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, classroom });
  } catch (error) {
    console.error("GET CLASSROOM ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
LIVE CLASS
====================================================== */
export const addLiveClass = async (req, res) => {
  try {
    const { title, meetLink, date } = req.body;

    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ success: false });
    }

    classroom.liveClasses.push({
      title,
      meetLink,
      date: new Date(date),
    });

    await classroom.save();

    res.json({ success: true });
  } catch (error) {
    console.error("LIVE CLASS ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
GET UPCOMING CLASSES ✅ FINAL FIX
====================================================== */
export const getUpcomingClasses = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false });
    }

    const classrooms = await Classroom.find({
      $or: [{ instructor: userId }, { "students.user": userId }],
    });

    let upcoming = [];

    classrooms.forEach((cls) => {
      if (!cls.liveClasses) return;

      cls.liveClasses.forEach((live) => {
        // ✅ SAFE DATE CHECK
        if (live.date && new Date(live.date) > new Date()) {
          upcoming.push({
            classroomTitle: cls.title,
            title: live.title,
            meetLink: live.meetLink,
            date: live.date,
          });
        }
      });
    });

    res.json({ success: true, upcoming });
  } catch (error) {
    console.error("🚨 UPCOMING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
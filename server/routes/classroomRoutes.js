import express from "express";
import {
  createClassroom,
  joinClassroom,
  getMyClassrooms,
  getMyCreatedClassrooms,
  addLiveClass,
  deleteClassroom,
  getClassroomById,
  createQuiz,
  markSelfAttendance,
  submitQuiz,
  getLeaderboard,
  getUpcomingClasses,
} from "../controllers/classroomController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ================= CLASSROOM ================= */
router.post("/create", protect, createClassroom);
router.post("/join", protect, joinClassroom);

router.get("/my", protect, getMyClassrooms);
router.get("/created", protect, getMyCreatedClassrooms);

/* ✅ IMPORTANT: KEEP SPECIFIC ROUTES ABOVE :id */
router.get("/upcoming", protect, getUpcomingClasses);

/* ================= DYNAMIC ROUTES ================= */
router.get("/:id", protect, getClassroomById);
router.delete("/:id", protect, deleteClassroom);

/* ================= LIVE CLASS ================= */
router.post("/:id/live", protect, addLiveClass);

/* ================= QUIZ ================= */
router.post("/:id/quiz", protect, createQuiz);
router.post("/:id/submit-quiz", protect, submitQuiz);
router.get("/:id/leaderboard", protect, getLeaderboard);

/* ================= ATTENDANCE ================= */
router.post("/mark-self/:id", protect, markSelfAttendance);

export default router;
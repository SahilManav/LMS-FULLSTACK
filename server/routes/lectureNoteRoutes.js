import express from "express";
import {
  saveLectureNote,
  getLectureNote,
} from "../controllers/lectureNoteController.js";

const router = express.Router();

/* ================= SAVE / UPDATE NOTE ================= */
router.post("/save", saveLectureNote);

/* ================= GET NOTE ================= */
router.get("/:userId/:lectureId", getLectureNote);

export default router;

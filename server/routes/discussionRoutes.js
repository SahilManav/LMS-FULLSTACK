import express from "express";
import {
  addQuestion,
  addReply,
  toggleUpvote,
  getDiscussionByLecture,
} from "../controllers/discussionController.js";

const router = express.Router();

/* ================= ADD QUESTION ================= */
router.post("/add-question", addQuestion);

/* ================= ADD REPLY ================= */
router.post("/add-reply", addReply);

/* ================= TOGGLE UPVOTE ================= */
router.post("/toggle-upvote", toggleUpvote);

/* ================= GET DISCUSSION BY LECTURE ================= */
router.get("/:lectureId", getDiscussionByLecture);

export default router;

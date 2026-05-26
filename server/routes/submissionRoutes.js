import express from "express";
import {
  submitAssignment,
  getSubmissions,
} from "../controllers/submissionController.js";

const router = express.Router();

/* ======================================================
   📤 SUBMIT ASSIGNMENT
====================================================== */
router.post("/submit", submitAssignment);

/* ======================================================
   📥 GET SUBMISSIONS (Educator)
====================================================== */
router.get("/:assignmentId", getSubmissions);

export default router;
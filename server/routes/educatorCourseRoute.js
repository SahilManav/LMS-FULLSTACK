import express from "express";
import multer from "multer";
import { requireAuth } from "@clerk/express";
import { protect } from "../middlewares/authMiddleware.js";

import {
  addCourse,
  getMyCourses,
  deleteCourse
} from "../controllers/educatorCourseController.js";

const router = express.Router();

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ADD COURSE
router.post(
  "/add-course",
  requireAuth(),
  protect,
  upload.single("image"),
  addCourse
);

// MY COURSES
router.get(
  "/my-courses",
  requireAuth(),
  protect,
  getMyCourses
);

// DELETE COURSE
router.delete(
  "/delete/:id",
  requireAuth(),
  protect,
  deleteCourse
);

export default router;

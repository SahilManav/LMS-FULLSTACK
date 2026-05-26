// server/routes/educatorRouter.js
import express from "express";
import {
  addCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
  deleteCourse,
} from "../controllers/educatorController.js";

import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authMiddleware.js";
import { requireAuth } from "@clerk/express";

const educatorRouter = express.Router();

// Become educator (Clerk + Mongo)
educatorRouter.get("/update-role", requireAuth(), updateRoleToEducator);

// Add course
educatorRouter.post(
  "/add-course",
  requireAuth(),
  protectEducator,
  upload.single("image"),
  addCourse
);

// Get educator courses
educatorRouter.get("/courses", requireAuth(), protectEducator, getEducatorCourses);

// Dashboard
educatorRouter.get("/dashboard", requireAuth(), protectEducator, educatorDashboardData);

// List of enrolled students
educatorRouter.get(
  "/enrolled-students",
  requireAuth(),
  protectEducator,
  getEnrolledStudentsData
);

// Delete course (educator)
educatorRouter.delete("/delete/:id", requireAuth(), protectEducator, deleteCourse);

export default educatorRouter;

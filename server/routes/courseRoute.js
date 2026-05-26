import express from "express";
import { requireAuth } from "@clerk/express";
import { protect } from "../middlewares/authMiddleware.js";

import {
  getAllCourses,
  getCourseById,
  getMyEnrollments,
  getCourseForPlayer,
  enrollCourse,
  rateCourse,
  getEducatorCourses,
  deleteCourse
} from "../controllers/courseController.js";

const router = express.Router();

/* ------------------ PUBLIC ROUTES ------------------ */
router.get("/all", getAllCourses); 
router.get("/details/:id", getCourseById);

/* ------------------ STUDENT ROUTES ------------------ */
router.get(
  "/my-enrollments",
  requireAuth(),
  protect,
  getMyEnrollments
);

router.get(
  "/player/:id",
  requireAuth(),
  protect,
  getCourseForPlayer
);

router.post(
  "/enroll/:id",
  requireAuth(),
  protect,
  enrollCourse
);

router.post(
  "/rate/:id",
  requireAuth(),
  protect,
  rateCourse
);

/* ------------------ EDUCATOR ROUTES ------------------ */
router.get(
  "/educator/my-courses",
  requireAuth(),
  protect,
  getEducatorCourses
);

router.delete(
  "/educator/delete/:id",
  requireAuth(),
  protect,
  deleteCourse
);

export default router;

import express from 'express';
import {
  addUserRating,
  getUserCourseProgress,
  getUserData,
  purchaseCourse,
  updateUserCourseProgress,
  userEnrolledCourses,
  removeEnrollment,
  removeEducatorRole
} from '../controllers/userController.js';

import { requireAuth } from '@clerk/express';

const userRouter = express.Router();

// Get user Data
userRouter.get('/data', requireAuth(), getUserData);

// Purchase Course
userRouter.post('/purchase', requireAuth(), purchaseCourse);

// Get enrolled courses
userRouter.get('/enrolled-courses', requireAuth(), userEnrolledCourses);

// Update progress
userRouter.post('/update-course-progress', requireAuth(), updateUserCourseProgress);

// Get progress
userRouter.post('/get-course-progress', requireAuth(), getUserCourseProgress);

// Add rating
userRouter.post('/add-rating', requireAuth(), addUserRating);

// Remove enrollment
userRouter.delete('/remove-enrollment/:courseId', requireAuth(), removeEnrollment);

// ⭐ Switch back to student
userRouter.get('/remove-educator', requireAuth(), removeEducatorRole);

export default userRouter;

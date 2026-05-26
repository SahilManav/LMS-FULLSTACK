import express from 'express';
import {
  getUserData,
  purchaseCourse,
  userEnrolledCourses,
  hideCourse,
  unhideCourse,
  updateUserCourseProgress,
  removeEnrollment,
  removeEducatorRole,
  completePurchase
} from '../controllers/userController.js';

import { requireAuth } from '@clerk/express';

const userRouter = express.Router();

// User Data
userRouter.get('/data', requireAuth(), getUserData);

// Purchase (multi-course)
userRouter.post('/purchase', requireAuth(), purchaseCourse);

// Complete purchase
userRouter.post('/complete-purchase', requireAuth(), completePurchase);

// Enrolled Courses
userRouter.get('/enrolled-courses', requireAuth(), userEnrolledCourses);

// Hide / Unhide
userRouter.post('/hide-course', requireAuth(), hideCourse);
userRouter.post('/unhide-course', requireAuth(), unhideCourse);

// Progress (only update)
userRouter.post('/update-course-progress', requireAuth(), updateUserCourseProgress);

// Remove enrollment
userRouter.delete('/remove-enrollment/:courseId', requireAuth(), removeEnrollment);

// Switch role
userRouter.get('/remove-educator', requireAuth(), removeEducatorRole);

export default userRouter;
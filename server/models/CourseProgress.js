import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: String, required: true },

    // Store completed lectures
    lectureCompleted: [
      {
        lectureId: String,
        completedAt: { type: Date, default: Date.now },
      },
    ],

    // Calculated %
    progressPercentage: {
      type: Number,
      default: 0,
    },

    // Track time spent in minutes
    timeSpent: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema
);

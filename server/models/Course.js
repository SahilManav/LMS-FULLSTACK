import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureId: String,
    lectureTitle: String,
    lectureDuration: Number,
    lectureUrl: String,
    isPreviewFree: Boolean,
    lectureOrder: Number,
  },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    chapterId: String,
    chapterOrder: Number,
    chapterTitle: String,
    chapterContent: [lectureSchema],
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    courseTitle: String,
    courseDescription: String,

    thumbnail: String, // CLOUDINARY URL ONLY!

    coursePrice: Number,
    isPublished: { type: Boolean, default: true },
    discount: Number,

    courseContent: [chapterSchema],

    educator: {
      type: String,
      ref: "User",
      required: true,
    },

    courseRatings: [
      {
        userId: String,
        rating: Number,
      },
    ],

    enrolledStudents: [String],

    category: String,
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    language: { type: String, default: "English" },
    duration: String,
    requirements: [String],
    whatYouWillLearn: [String],
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;

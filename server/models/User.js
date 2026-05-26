import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Clerk User ID

    name: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: { type: String, default: "" },

    // ⭐ ROLE FIELD
    role: {
      type: String,
      enum: ["student", "educator"],
      default: "student",
    },

    // 🏆 LEADERBOARD FIELDS
    score: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },

    // ✅ Enrolled courses
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    // 🔥 Hidden courses
    hiddenCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

// Prevent undefined arrays
userSchema.pre("save", function (next) {
  if (!this.enrolledCourses) this.enrolledCourses = [];
  if (!this.hiddenCourses) this.hiddenCourses = [];
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
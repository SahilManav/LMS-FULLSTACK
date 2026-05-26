// server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Clerk User ID

    name: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: { type: String, default: "" },

    // ⭐ ROLE FIELD (Important)
    role: {
      type: String,
      enum: ["student", "educator"],
      default: "student",
    },

    // Courses user is enrolled in
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

// Prevent undefined array fields
userSchema.pre("save", function (next) {
  if (!this.enrolledCourses) this.enrolledCourses = [];
  next();
});

const User = mongoose.model("User", userSchema);

export default User;

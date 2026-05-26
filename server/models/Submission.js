import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: String, // from classroom.assignments
      required: true,
    },

    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: String,

    fileUrl: {
      type: String, // link / file path
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    marks: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);
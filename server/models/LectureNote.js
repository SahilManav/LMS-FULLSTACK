import mongoose from "mongoose";

const lectureNoteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    lectureId: {
      type: String,
      required: true,
    },
    noteContent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate note per user per lecture
lectureNoteSchema.index(
  { userId: 1, lectureId: 1 },
  { unique: true }
);

export default mongoose.model("LectureNote", lectureNoteSchema);

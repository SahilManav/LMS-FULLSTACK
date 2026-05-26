import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    replyText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const discussionSchema = new mongoose.Schema(
  {
    lectureId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    replies: [replySchema],
    upvotes: [
      {
        type: String, // userId
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Discussion", discussionSchema);

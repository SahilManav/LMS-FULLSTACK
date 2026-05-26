// server/models/Purchase.js
import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    // 🔥 MULTIPLE COURSES
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
    ],

    userId: {
      type: String, // Clerk user id
      ref: "User",
      required: true,
    },

    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Purchase = mongoose.model("Purchase", PurchaseSchema);
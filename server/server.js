/* eslint-disable no-unused-vars */
import express from "express";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";

import userRouter from "./routes/userRoutes.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import educatorCourseRouter from "./routes/educatorCourseRoute.js";
import progressRouter from "./routes/progressRoute.js";
import certificateRouter from "./routes/certificateRoute.js";
import lectureNoteRoutes from "./routes/lectureNoteRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";

import { clerkMiddleware } from "@clerk/express";
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";

import path from "path";
import { fileURLToPath } from "url";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ======================================================
   🔌 CONNECT DB + CLOUDINARY
====================================================== */
await connectDB();
await connectCloudinary();

/* ======================================================
   🌍 CORS
====================================================== */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://lms-fullstack-eight.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

/* ======================================================
   🔔 STRIPE WEBHOOKS
====================================================== */
app.post(
  "/api/webhooks/stripe",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhooks
);

/* ======================================================
   📦 JSON PARSER
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ======================================================
   🖼️ SERVE STATIC IMAGES
====================================================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================================================
   🔐 CLERK AUTH
====================================================== */
app.use(clerkMiddleware());

/* ======================================================
   🐞 DEBUG LOGGER
====================================================== */
app.use((req, _res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

/* ======================================================
   📌 API ROUTES
====================================================== */

app.get("/", (_req, res) => {
  res.send("✅ Edemy API is running successfully!");
});

app.post("/api/webhooks/clerk", express.json(), clerkWebhooks);

app.use("/api/user", userRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/educator/course", educatorCourseRouter);
app.use("/api/course", courseRouter);
app.use("/api/progress", progressRouter);
app.use("/api/certificate", certificateRouter);
app.use("/api/notes", lectureNoteRoutes);
app.use("/api/discussion", discussionRoutes);
app.use("/api/classroom", classroomRoutes);
app.use("/api/submission", submissionRoutes);

// ✅ FIXED POSITION (IMPORTANT)
app.use("/api/leaderboard", leaderboardRoutes);

/* ======================================================
   ❌ 404
====================================================== */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* ======================================================
   ❌ ERROR HANDLER
====================================================== */
app.use((err, _req, res, _next) => {
  console.error("❌ Global Error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

/* ======================================================
   🚀 START SERVER
====================================================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
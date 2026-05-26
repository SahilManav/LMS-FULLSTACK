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

import { clerkMiddleware } from "@clerk/express";
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";

import path from "path";
import { fileURLToPath } from "url";

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
    origin: "*",
    credentials: true,
  })
);

/* ======================================================
   🔔 STRIPE WEBHOOKS (before JSON parser)
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

// Clerk webhook
app.post("/api/webhooks/clerk", express.json(), clerkWebhooks);

// User Routes
app.use("/api/user", userRouter);

// Educator Profile Routes
app.use("/api/educator", educatorRouter);

// ⭐ Educator Course Management
app.use("/api/educator/course", educatorCourseRouter);

// Public + Student Course Routes
app.use("/api/course", courseRouter);

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

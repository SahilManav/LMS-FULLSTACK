// server/middlewares/authMiddleware.js
import { clerkClient } from "@clerk/express";

/* =======================================================
   ✅ General Auth Middleware
======================================================= */
export const protect = async (req, res, next) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await clerkClient.users.getUser(userId);

    req.user = {
      _id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || "",
      role: user.publicMetadata?.role || "student",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      imageUrl: user.imageUrl || "",
    };

    next();
  } catch (error) {
    console.error("❌ Protect Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Authorization failed",
    });
  }
};

/* =======================================================
   ✅ Educator-only Middleware
======================================================= */
export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.publicMetadata?.role !== "educator") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Educators only",
      });
    }

    req.user = {
      _id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || "",
      role: "educator",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      imageUrl: user.imageUrl || "",
    };

    next();
  } catch (error) {
    console.error("❌ protectEducator error:", error);
    return res.status(401).json({
      success: false,
      message: "Authorization failed",
    });
  }
};
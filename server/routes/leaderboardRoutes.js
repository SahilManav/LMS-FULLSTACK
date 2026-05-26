import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET LEADERBOARD
router.get("/", async (req, res) => {
  try {
    const type = req.query.type || "score";

    const sortField =
      type === "courses"
        ? "coursesCompleted"
        : "score";

    let users = await User.find().select(
      "name email score coursesCompleted imageUrl enrolledCourses"
    );

    // Remove stale data users
    users = users.filter((user) => {
      const score = user.score || 0;
      const completed =
        user.coursesCompleted || 0;

      const enrolled =
        user.enrolledCourses?.length || 0;

      return (
        score > 0 ||
        completed > 0 ||
        enrolled > 0
      );
    });

    users.sort(
      (a, b) =>
        (b[sortField] || 0) -
        (a[sortField] || 0)
    );

    users = users.slice(0, 10);

    res.json(users);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error fetching leaderboard",
    });
  }
});

export default router;
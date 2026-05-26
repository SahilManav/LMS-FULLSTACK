import Discussion from "../models/Discussion.js";

/* ================= ADD QUESTION ================= */
export const addQuestion = async (req, res) => {
  try {
    const { lectureId, userId, question } = req.body;

    if (!lectureId || !userId || !question) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newDiscussion = await Discussion.create({
      lectureId,
      userId,
      question,
    });

    res.status(201).json({
      success: true,
      discussion: newDiscussion,
    });
  } catch (error) {
    console.error("Add Question Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding question",
    });
  }
};

/* ================= ADD REPLY ================= */
export const addReply = async (req, res) => {
  try {
    const { discussionId, userId, replyText } = req.body;

    if (!discussionId || !userId || !replyText) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    discussion.replies.push({
      userId,
      replyText,
    });

    await discussion.save();

    res.status(200).json({
      success: true,
      discussion,
    });
  } catch (error) {
    console.error("Add Reply Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding reply",
    });
  }
};

/* ================= TOGGLE UPVOTE ================= */
export const toggleUpvote = async (req, res) => {
  try {
    const { discussionId, userId } = req.body;

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    const alreadyUpvoted = discussion.upvotes.includes(userId);

    if (alreadyUpvoted) {
      discussion.upvotes = discussion.upvotes.filter(
        (id) => id !== userId
      );
    } else {
      discussion.upvotes.push(userId);
    }

    await discussion.save();

    res.status(200).json({
      success: true,
      discussion,
    });
  } catch (error) {
    console.error("Upvote Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while toggling upvote",
    });
  }
};

/* ================= GET DISCUSSION BY LECTURE ================= */
export const getDiscussionByLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const discussions = await Discussion.find({ lectureId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      discussions,
    });
  } catch (error) {
    console.error("Fetch Discussion Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching discussion",
    });
  }
};

import LectureNote from "../models/LectureNote.js";

/* ================= SAVE OR UPDATE NOTE ================= */
export const saveLectureNote = async (req, res) => {
  try {
    const { userId, courseId, lectureId, noteContent } = req.body;

    if (!userId || !lectureId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const note = await LectureNote.findOneAndUpdate(
      { userId, lectureId },
      { courseId, noteContent },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Save Note Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving note",
    });
  }
};

/* ================= GET NOTE ================= */
export const getLectureNote = async (req, res) => {
  try {
    const { userId, lectureId } = req.params;

    const note = await LectureNote.findOne({ userId, lectureId });

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Get Note Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching note",
    });
  }
};

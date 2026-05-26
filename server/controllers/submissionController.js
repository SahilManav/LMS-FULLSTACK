import Submission from "../models/Submission.js";

/* ======================================================
   📤 SUBMIT ASSIGNMENT (Student)
====================================================== */
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, classroomId, fileUrl } = req.body;

    // check already submitted
    const existing = await Submission.findOne({
      assignmentId,
      student: req.user._id,
    });

    if (existing) {
      return res.json({
        success: false,
        message: "Already submitted",
      });
    }

    const submission = await Submission.create({
      assignmentId,
      classroomId,
      student: req.user._id,
      name: req.user.name,
      fileUrl,
    });

    res.json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Submit Assignment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   📥 GET SUBMISSIONS (Educator)
====================================================== */
export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      assignmentId: req.params.assignmentId,
    });

    res.json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error("Get Submissions Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
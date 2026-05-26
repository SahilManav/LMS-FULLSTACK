import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true,
  },

  instructor: {
    type: String,
    ref: "User",
    required: true,
  },

  joinCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
  },

  students: [
    {
      user: {
        type: String,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        default: "Student",
      },
      email: {
        type: String,
        default: "",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  courses: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      title: {
        type: String,
        default: "",
      },
    },
  ],

  liveClasses: [
    {
      title: {
        type: String,
        required: true,
      },
      meetLink: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  assignments: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: "",
      },
      dueDate: {
        type: Date,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  attendance: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      records: [
        {
          student: {
            type: String,
            ref: "User",
          },
          name: {
            type: String,
            default: "",
          },
          status: {
            type: String,
            enum: ["present", "absent"],
            default: "present",
          },
        },
      ],
    },
  ],

  // ✅ QUIZZES (your existing — untouched)
  quizzes: [
    {
      title: {
        type: String,
        required: true,
      },
      questions: [
        {
          question: String,
          options: [String],
          correctAnswer: Number,
        },
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // 🔥 NEW (ADDED FOR QUIZ SYSTEM)
  quizAttempts: [
    {
      quizIndex: Number,
      student: String,
      answers: [Number],
      score: Number,
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

},
{ timestamps: true }
);

export default mongoose.model("Classroom", classroomSchema);
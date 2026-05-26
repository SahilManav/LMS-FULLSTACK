/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  createClassroom,
  getCreatedClassrooms,
  addLiveClass,
  createQuiz,
} from "../../api/classroomApi";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const CreateClassroom = () => {
  const [title, setTitle] = useState("");
  const [classrooms, setClassrooms] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // ✅ FIX: separate state per classroom
  const [liveData, setLiveData] = useState({});

  const [quizData, setQuizData] = useState({
    title: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  const { getToken } = useAuth();
  const navigate = useNavigate();

  const backendUrl = "http://localhost:5000";

  /* ================= FETCH ================= */
  const fetchClassrooms = async () => {
    try {
      const token = await getToken();
      localStorage.setItem("token", token);

      const res = await getCreatedClassrooms();
      setClassrooms(res.classrooms || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    try {
      if (!title) return alert("Enter title");

      const token = await getToken();
      localStorage.setItem("token", token);

      const res = await createClassroom({ title });

      alert(`Classroom Created!\nCode: ${res.classroom.joinCode}`);

      setTitle("");
      fetchClassrooms();
    } catch (err) {
      console.error(err);
      alert("Error creating classroom");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this classroom?")) return;

    try {
      setLoadingId(id);

      const token = await getToken();

      await axios.delete(`${backendUrl}/api/classroom/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setClassrooms((prev) => prev.filter((cls) => cls._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  /* ================= ADD LIVE CLASS ================= */
  const handleAddLive = async (classId) => {
    try {
      const data = liveData[classId] || {};

      if (!data.title || !data.meetLink || !data.date) {
        return alert("Please fill all fields");
      }

      const token = await getToken();
      localStorage.setItem("token", token);

      await addLiveClass(classId, data);

      alert("Live Class Added 🎥");

      setLiveData((prev) => ({
        ...prev,
        [classId]: { title: "", meetLink: "", date: "" },
      }));
    } catch (err) {
      console.error(err);
      alert("Error adding live class");
    }
  };

  /* ================= CREATE QUIZ ================= */
  const handleCreateQuiz = async (classId) => {
    try {
      const token = await getToken();
      localStorage.setItem("token", token);

      await createQuiz(classId, {
        title: quizData.title,
        questions: [
          {
            question: quizData.question,
            options: quizData.options,
            correctAnswer: quizData.correctAnswer,
          },
        ],
      });

      alert("Quiz Created 🧠");

      setQuizData({
        title: "",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create Classroom</h2>

      {/* CREATE */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          type="text"
          placeholder="Enter class title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Classroom
        </button>
      </div>

      {/* LIST */}
      <h3 className="text-lg font-semibold mb-4">Your Classrooms</h3>

      {classrooms.map((cls) => {
        const currentLive = liveData[cls._id] || {
          title: "",
          meetLink: "",
          date: "",
        };

        return (
          <div key={cls._id} className="border p-4 rounded mb-6 bg-gray-50">
            <h4 className="font-semibold text-lg">{cls.title}</h4>
            <p className="text-sm mb-3">
              Code: <span className="text-blue-600">{cls.joinCode}</span>
            </p>

            <button
              onClick={() => navigate(`/educator/classroom/${cls._id}`)}
              className="bg-green-600 text-white px-3 py-1 rounded mr-2"
            >
              Open
            </button>

            <button
              onClick={() => handleDelete(cls._id)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete
            </button>

            {/* LIVE CLASS */}
            <div className="mt-4 p-3 bg-white rounded shadow">
              <h4 className="font-semibold mb-2">Add Live Class</h4>

              <input
                placeholder="Title"
                value={currentLive.title}
                onChange={(e) =>
                  setLiveData((prev) => ({
                    ...prev,
                    [cls._id]: { ...currentLive, title: e.target.value },
                  }))
                }
                className="border p-1 w-full mb-2"
              />

              <input
                placeholder="Google Meet Link"
                value={currentLive.meetLink}
                onChange={(e) =>
                  setLiveData((prev) => ({
                    ...prev,
                    [cls._id]: { ...currentLive, meetLink: e.target.value },
                  }))
                }
                className="border p-1 w-full mb-2"
              />

              <input
                type="datetime-local"
                value={currentLive.date}
                onChange={(e) =>
                  setLiveData((prev) => ({
                    ...prev,
                    [cls._id]: { ...currentLive, date: e.target.value },
                  }))
                }
                className="border p-1 w-full mb-2"
              />

              <button
                onClick={() => handleAddLive(cls._id)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Add Live Class
              </button>
            </div>

            {/* QUIZ */}
            <div className="mt-4 p-3 bg-white rounded shadow">
              <h4 className="font-semibold mb-2">Create Quiz</h4>

              <input
                placeholder="Quiz Title"
                value={quizData.title}
                onChange={(e) =>
                  setQuizData({ ...quizData, title: e.target.value })
                }
                className="border p-1 w-full mb-2"
              />

              <input
                placeholder="Question"
                value={quizData.question}
                onChange={(e) =>
                  setQuizData({ ...quizData, question: e.target.value })
                }
                className="border p-1 w-full mb-2"
              />

              {quizData.options.map((opt, i) => (
                <input
                  key={i}
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...quizData.options];
                    newOptions[i] = e.target.value;
                    setQuizData({ ...quizData, options: newOptions });
                  }}
                  className="border p-1 w-full mb-2"
                />
              ))}

              <select
                value={quizData.correctAnswer}
                onChange={(e) =>
                  setQuizData({
                    ...quizData,
                    correctAnswer: Number(e.target.value),
                  })
                }
                className="border p-1 mb-2"
              >
                <option value={0}>Correct: Option 1</option>
                <option value={1}>Correct: Option 2</option>
                <option value={2}>Correct: Option 3</option>
                <option value={3}>Correct: Option 4</option>
              </select>

              <button
                onClick={() => handleCreateQuiz(cls._id)}
                className="bg-purple-600 text-white px-3 py-1 rounded"
              >
                Create Quiz
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CreateClassroom;
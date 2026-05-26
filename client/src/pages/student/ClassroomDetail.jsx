/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { getClassroomById } from "../../api/classroomApi";
import { useAuth } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";

const ClassroomDetail = () => {
  const { id } = useParams();
  const { isEducator } = useContext(AppContext);
  const { getToken } = useAuth();

  const [classroom, setClassroom] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchClassroom();
  }, []);

  const fetchClassroom = async () => {
    try {
      const token = await getToken();
      localStorage.setItem("token", token);

      const res = await getClassroomById(id);
      setClassroom(res.classroom);
    } catch (err) {
      alert("Error loading classroom");
    }
  };

  /* ================= ATTENDANCE ================= */
  const markMyAttendance = async () => {
    try {
      const token = await getToken();

      await axios.post(
        `http://localhost:5000/api/classroom/mark-self/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAttendanceMarked(true);
      alert("Attendance Marked ✅");
      fetchClassroom(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= QUIZ ================= */
  const startQuiz = (quiz, index) => {
    if (!quiz?.questions?.length) return;

    setActiveQuiz({ ...quiz, index });
    setAnswers(new Array(quiz.questions.length).fill(null));
    setResult(null);
  };

  const selectAnswer = (qIndex, optionIndex) => {
    const updated = [...answers];
    updated[qIndex] = optionIndex;
    setAnswers(updated);
  };

  const submitQuiz = async () => {
    try {
      if (answers.includes(null)) {
        return alert("Please answer all questions");
      }

      const token = await getToken();

      const res = await axios.post(
        `http://localhost:5000/api/classroom/${id}/submit-quiz`,
        {
          quizIndex: activeQuiz.index,
          answers,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResult(res.data);
      fetchClassroom(); // refresh attempts
    } catch (err) {
      console.error(err);
      alert("Error submitting quiz");
    }
  };

  if (!classroom) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold">{classroom.title}</h1>
        <p className="mt-2 text-gray-500">
          Join Code: <span className="font-mono">{classroom.joinCode}</span>
        </p>
      </div>

      {/* ================= LIVE ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">📺 Live Classes</h2>

        {!classroom.liveClasses?.length ? (
          <p>No live classes</p>
        ) : (
          classroom.liveClasses.map((live, i) => (
            <div key={i} className="flex justify-between mb-3">
              <div>
                <h3 className="font-medium">{live.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(live.date).toLocaleString()}
                </p>
              </div>
              <a
                href={live.meetLink}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Join
              </a>
            </div>
          ))
        )}
      </div>

      {/* ================= ATTENDANCE BUTTON ================= */}
      {!isEducator && (
        <button
          onClick={markMyAttendance}
          disabled={attendanceMarked}
          className={`px-4 py-2 rounded mb-6 ${
            attendanceMarked
              ? "bg-gray-400"
              : "bg-green-600 text-white"
          }`}
        >
          {attendanceMarked ? "Attendance Marked" : "Mark Attendance"}
        </button>
      )}

      {/* ================= QUIZ LIST ================= */}
      {!activeQuiz && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">🧠 Quizzes</h2>

          {!classroom.quizzes?.length ? (
            <p>No quizzes</p>
          ) : (
            classroom.quizzes.map((quiz, i) => (
              <div key={i} className="border p-3 mb-3 rounded">
                <h3 className="font-medium">{quiz.title}</h3>

                <button
                  onClick={() => startQuiz(quiz, i)}
                  className="bg-purple-600 text-white px-4 py-2 rounded mt-2"
                >
                  Attempt Quiz
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= QUIZ ATTEMPT ================= */}
      {activeQuiz && !result && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">{activeQuiz.title}</h2>

          {activeQuiz.questions.map((q, i) => (
            <div key={i} className="mb-4">
              <p className="font-medium">{q.question}</p>

              {q.options.map((opt, j) => (
                <button
                  key={j}
                  onClick={() => selectAnswer(i, j)}
                  className={`block w-full text-left p-2 border mt-1 rounded ${
                    answers[i] === j ? "bg-blue-200" : ""
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}

          <button
            onClick={submitQuiz}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Submit Quiz
          </button>
        </div>
      )}

      {/* ================= RESULT ================= */}
      {result && (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold">🎉 Result</h2>
          <p className="mt-4 text-lg">
            Score: {result.score} / {result.total}
          </p>

          <button
            onClick={() => {
              setActiveQuiz(null);
              setResult(null);
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      )}

      {/* ================= QUIZ ATTEMPTS ================= */}
      {isEducator && (
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="text-xl font-bold mb-4">📊 Quiz Attempts</h2>

          {!classroom.quizAttempts?.length ? (
            <p>No attempts yet</p>
          ) : (
            classroom.quizAttempts.map((a, i) => {
              const student = classroom.students.find(
                (s) => s.user === a.student
              );

              return (
                <div key={i} className="border p-3 mb-2 rounded">
                  <p><strong>Name:</strong> {student?.name || "Unknown"}</p>
                  <p><strong>Email:</strong> {student?.email}</p>
                  <p><strong>Score:</strong> {a.score}</p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= ATTENDANCE VIEW ================= */}
      {isEducator && (
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="text-xl font-bold mb-4">📅 Attendance</h2>

          {!classroom.attendance?.length ? (
            <p>No attendance yet</p>
          ) : (
            classroom.attendance.map((day, i) => (
              <div key={i} className="mb-4">
                <p className="font-semibold">
                  {new Date(day.date).toLocaleDateString()}
                </p>

                {day.records.map((r, j) => (
                  <div key={j} className="border p-2 rounded mt-1">
                    <p><strong>Name:</strong> {r.name}</p>
                    <p>Status: {r.status}</p>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default ClassroomDetail;
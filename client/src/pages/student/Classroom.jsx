/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyClassrooms,
  joinClassroom,
} from "../../api/classroomApi";
import { AppContext } from "../../context/AppContext";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

const Classroom = () => {
  const [classes, setClasses] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 NEW STATE
  const [upcoming, setUpcoming] = useState([]);

  const navigate = useNavigate();
  const { isEducator } = useContext(AppContext);
  const { getToken } = useAuth();

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchClasses();
    fetchUpcoming(); // 🔥 NEW
  }, []);

  const fetchClasses = async () => {
    try {
      const token = await getToken();
      localStorage.setItem("token", token);

      const res = await getMyClassrooms();
      setClasses(res.classrooms || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH UPCOMING ================= */
  const fetchUpcoming = async () => {
    try {
      const token = await getToken();

      const res = await axios.get(
        "http://localhost:5000/api/classroom/upcoming",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ FIXED (safe optional chaining)
      setUpcoming(res.data?.upcoming || []);
    } catch (err) {
      console.error("Upcoming error:", err);
    }
  };

  /* ================= JOIN ================= */
  const handleJoin = async () => {
    if (!joinCode) {
      alert("Enter join code");
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();
      localStorage.setItem("token", token);

      await joinClassroom({ code: joinCode });

      alert("Joined successfully 🎉");

      setJoinCode("");
      await fetchClasses();
      await fetchUpcoming(); // 🔥 refresh upcoming
    } catch (err) {
      console.error(err);
      alert("Invalid or expired code ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          My Classrooms
        </h1>
        <p className="text-gray-500">
          Join or manage your classrooms easily
        </p>
      </div>

      {/* 🔥 UPCOMING CLASSES */}
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          🔔 Upcoming Classes
        </h2>

        {upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming classes 🚫</p>
        ) : (
          upcoming.map((cls, index) => (
            <div
              key={index}
              className="border p-3 rounded mb-3 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold">
                  {cls.classroomTitle}
                </h3>
                <p>{cls.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(cls.date).toLocaleString()}
                </p>
              </div>

              <a
                href={cls.meetLink}
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

      {/* JOIN BOX */}
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Enter Classroom Code..."
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
        />

        <button
          onClick={handleJoin}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {loading ? "Joining..." : "Join Classroom"}
        </button>
      </div>

      {/* CLASS LIST */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            No classrooms joined yet 😔
          </div>
        ) : (
          classes.map((cls) => (
            <div key={cls._id} className="bg-white rounded-xl shadow p-5">
              <h2 className="text-xl font-semibold mb-2">
                {cls.title}
              </h2>

              <p className="text-sm mb-4">
                Code: {cls.joinCode}
              </p>

              <button
                onClick={() =>
                  navigate(
                    isEducator
                      ? `/educator/classroom/${cls._id}`
                      : `/classroom/${cls._id}`
                  )
                }
                className="w-full bg-black text-white py-2 rounded"
              >
                Enter Classroom
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Classroom;
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [type, setType] = useState("score");
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/leaderboard?type=${type}`
      );

      const filteredUsers = (res.data || []).filter((user) => {
        const score = user.score || 0;
        const courses = user.coursesCompleted || 0;

        return score > 0 || courses > 0;
      });

      setUsers(filteredUsers);

    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 UPDATED
  useEffect(() => {
    fetchLeaderboard();

    const handleLeaderboardUpdate = () => {
      fetchLeaderboard();
    };

    window.addEventListener(
      "leaderboardUpdated",
      handleLeaderboardUpdate
    );

    return () => {
      window.removeEventListener(
        "leaderboardUpdated",
        handleLeaderboardUpdate
      );
    };
  }, [type]);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-8">

      <h1 className="text-4xl font-bold text-center text-yellow-400 mb-6">
        🏆 Leaderboard
      </h1>

      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => setType("score")}
          className={`px-4 py-2 rounded ${
            type === "score"
              ? "bg-yellow-500 text-black"
              : "bg-gray-700"
          }`}
        >
          Score
        </button>

        <button
          onClick={() => setType("courses")}
          className={`px-4 py-2 rounded ${
            type === "courses"
              ? "bg-yellow-500 text-black"
              : "bg-gray-700"
          }`}
        >
          Courses
        </button>
      </div>

      {loading && (
        <div className="text-center mt-20">
          Loading...
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center mt-20">
          <div className="text-6xl mb-4">📭</div>

          <h2 className="text-2xl font-bold text-gray-300">
            No leaderboard data available
          </h2>

          <p className="text-gray-500 mt-2">
            Add courses and student activity to generate rankings
          </p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <>
          <div className="flex justify-center items-end gap-6 mb-12">

            {top3.map((user, index) => (
              <div
                key={user._id}
                className={`${
                  index === 0
                    ? "bg-yellow-500 text-black p-8 w-56 scale-110"
                    : "bg-gray-800 p-6 w-48"
                } rounded-xl text-center`}
              >
                <img
                  src={
                    user.imageUrl ||
                    "https://i.pravatar.cc/100"
                  }
                  className="w-16 h-16 rounded-full mx-auto my-2"
                />

                <p>{user.name}</p>

                <p>
                  {type === "score"
                    ? `${user.score || 0} pts`
                    : `${user.coursesCompleted || 0} courses`}
                </p>
              </div>
            ))}

          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {rest.map((user, index) => (
              <div
                key={user._id}
                className="flex justify-between items-center bg-gray-900 p-4 rounded-xl"
              >
                <div className="flex gap-4 items-center">

                  <span>#{index + 4}</span>

                  <img
                    src={
                      user.imageUrl ||
                      "https://i.pravatar.cc/40"
                    }
                    className="w-10 h-10 rounded-full"
                  />

                  <div>
                    <p>{user.name}</p>
                    <p className="text-sm text-gray-400">
                      {user.email}
                    </p>
                  </div>

                </div>

                <span className="text-yellow-400">
                  {type === "score"
                    ? `${user.score || 0} pts`
                    : `${user.coursesCompleted || 0} courses`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
};

export default Leaderboard;
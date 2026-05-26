import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const Profile = () => {
  const { userData, user, enrolledCourses } = useContext(AppContext);

  const totalCourses = enrolledCourses?.length || 0;

  // Joined date
  const joined =
    userData?.createdAt
      ? new Date(userData.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

  // Profile image (Clerk > Backend fallback)
  const avatar =
    user?.imageUrl ||
    userData?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${userData?.name || "U"}`;

  return (
    <div className="min-h-screen px-6 md:px-36 pt-14 pb-10 bg-gradient-to-b from-white via-blue-50/40 to-white">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold text-gray-900 mb-10">
        My Profile
      </h1>

      <div className="grid md:grid-cols-3 gap-10">

        {/* ---------------- LEFT: PROFILE CARD ---------------- */}
        <div className="bg-white/70 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-8 flex flex-col items-center hover:shadow-2xl transition-all">

          <img
            src={avatar}
            alt="avatar"
            className="w-32 h-32 rounded-full shadow-md object-cover border"
          />

          <h2 className="text-xl font-semibold mt-4">
            {userData?.name || user?.fullName || "Student"}
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            {userData?.email || user?.primaryEmailAddress?.emailAddress}
          </p>

          <div className="mt-6 w-full">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium">{joined}</p>
          </div>

          <div className="mt-4 w-full">
            <p className="text-sm text-gray-500">Enrolled Courses</p>
            <p className="font-medium">{totalCourses}</p>
          </div>

          {/* Button */}
          <button
            className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl font-medium shadow"
            onClick={() => window.location.href = "/my-enrollments"}
          >
            View My Courses
          </button>
        </div>

        {/* ---------------- RIGHT SIDE: STATS ---------------- */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* BADGE */}
          <div className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl border shadow hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-gray-800">Current Badge</h3>

            <p className="mt-4 text-2xl font-bold text-yellow-600">
              {totalCourses === 0 && "New Learner"}
              {totalCourses > 0 && totalCourses <= 3 && "Beginner"}
              {totalCourses > 3 && totalCourses <= 7 && "Knowledge Seeker"}
              {totalCourses > 7 && totalCourses <= 12 && "Advanced Learner"}
              {totalCourses > 12 && "Master Learner"}
            </p>

            <p className="text-gray-500 mt-1 text-sm">
              Earn badges by learning more!
            </p>
          </div>

          {/* COURSES STAT */}
          <div className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl border shadow hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-gray-800">
              Total Enrolled Courses
            </h3>
            <p className="mt-3 text-5xl font-extrabold text-blue-600">
              {totalCourses}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Great job! Keep learning 📚
            </p>
          </div>

          {/* PROGRESS GRAPH */}
          <div className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl border shadow sm:col-span-2 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Learning Progress
            </h3>

            <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-600"
                style={{
                  width: `${Math.min(100, totalCourses * 12)}%`,
                }}
              ></div>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              This bar fills as you enroll and progress through your courses.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Profile;


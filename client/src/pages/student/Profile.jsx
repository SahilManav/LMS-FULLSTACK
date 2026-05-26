import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const Profile = () => {
  const { userData, enrolledCourses, backendUrl, getToken } =
    useContext(AppContext);

  const { user } = useUser();

  const [stats, setStats] = useState({
    completedCourses: 0,
    totalMinutes: 0,
    overallProgress: 0,
  });

  const totalCourses = enrolledCourses?.length || 0;

  /* ============================
     FETCH ALL PROGRESS
  ============================ */
  const fetchAllProgress = async () => {
    try {
      if (!user || !enrolledCourses?.length) return;

      const token = await getToken();

      const results = await Promise.all(
        enrolledCourses.map(async (course) => {
          try {
            const { data } = await axios.get(
              `${backendUrl}/api/progress/${user.id}/${course._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            return {
              completed: data?.completed || false,
              timeSpent: data?.timeSpent || 0,
              progressPercentage:
                data?.progressPercentage || 0,
            };
          } catch {
            return {
              completed: false,
              timeSpent: 0,
              progressPercentage: 0,
            };
          }
        })
      );

      const totalCompleted =
        results.filter(
          (item) => item.completed
        ).length;

      const totalMinutes =
        results.reduce(
          (sum, item) =>
            sum + item.timeSpent,
          0
        );

      const totalPercent =
        results.reduce(
          (sum, item) =>
            sum + item.progressPercentage,
          0
        );

      const overallProgress =
        results.length > 0
          ? Math.round(
              totalPercent /
                results.length
            )
          : 0;

      setStats({
        completedCourses:
          totalCompleted,
        totalMinutes,
        overallProgress,
      });

    } catch (err) {
      console.log(
        "Profile progress fetch error:",
        err
      );
    }
  };

  useEffect(() => {
    fetchAllProgress();
  }, [user, enrolledCourses]);

  /* ============================
     BADGE LOGIC
  ============================ */

  const getBadge = () => {
    if (stats.completedCourses >= 10)
      return "Master Learner";

    if (stats.completedCourses >= 5)
      return "Advanced Learner";

    if (stats.completedCourses >= 2)
      return "Knowledge Seeker";

    if (stats.completedCourses >= 1)
      return "Beginner";

    return "New Learner";
  };

  const joined =
    userData?.createdAt
      ? new Date(
          userData.createdAt
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

  const avatar =
    user?.imageUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${userData?.name || "U"}`;

  return (
    <div className="min-h-screen px-6 md:px-36 pt-14 pb-10 bg-gradient-to-b from-white via-blue-50/40 to-white">
      <h1 className="text-3xl font-bold text-gray-900 mb-10">
        My Profile
      </h1>

      <div className="grid md:grid-cols-3 gap-10">

        <div className="bg-white/70 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-8 flex flex-col items-center">
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
            <p className="text-sm text-gray-500">
              Member Since
            </p>
            <p className="font-medium">{joined}</p>
          </div>

          <div className="mt-4 w-full">
            <p className="text-sm text-gray-500">
              Enrolled Courses
            </p>
            <p className="font-medium">{totalCourses}</p>
          </div>

          <div className="mt-4 w-full">
            <p className="text-sm text-gray-500">
              Completed Courses
            </p>
            <p className="font-medium">
              {stats.completedCourses}
            </p>
          </div>

          <div className="mt-4 w-full">
            <p className="text-sm text-gray-500">
              Learning Time
            </p>
            <p className="font-medium">
              {Math.floor(stats.totalMinutes / 60)}h{" "}
              {stats.totalMinutes % 60}m
            </p>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">

          <div className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl border shadow">
            <h3 className="text-lg font-semibold text-gray-800">
              Current Badge
            </h3>

            <p className="mt-4 text-2xl font-bold text-yellow-600">
              {getBadge()}
            </p>

            <p className="text-gray-500 mt-1 text-sm">
              Earn badges by completing courses!
            </p>
          </div>

          <div className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl border shadow">
            <h3 className="text-lg font-semibold text-gray-800">
              Overall Completion
            </h3>

            <p className="mt-3 text-5xl font-extrabold text-blue-600">
              {stats.overallProgress}%
            </p>

            <p className="text-gray-500 text-sm mt-1">
              Across all enrolled courses
            </p>
          </div>

          <div className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl border shadow sm:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Learning Progress
            </h3>

            <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-600"
                style={{
                  width: `${stats.overallProgress}%`,
                }}
              />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              This bar reflects your real learning progress.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
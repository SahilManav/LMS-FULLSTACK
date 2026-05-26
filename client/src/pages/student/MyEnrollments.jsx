import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import Footer from "../../components/student/Footer";
import { toast } from "react-toastify";

const fallbackThumb =
  "https://res.cloudinary.com/dqmyi3x1y/image/upload/v1763106378/javascript_course_joamk1.png";

const resolveThumb = (thumb) =>
  thumb && thumb.trim().length > 3 ? thumb : fallbackThumb;

const MyEnrollments = () => {
  const {
    userData,
    enrolledCourses,
    fetchUserEnrolledCourses,
    navigate,
    backendUrl,
    getToken,
    calculateCourseDuration,
    calculateNoOfLectures,
  } = useContext(AppContext);

  const [progressArray, setProgressArray] = useState([]);
  const [loading, setLoading] = useState(true);

  const safePercent = (completed, total) => {
    if (!total || total <= 0) return 0;
    const pct = (completed * 100) / total;
    return Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 0;
  };

  const safeCourseDuration = (course) => {
    try {
      return calculateCourseDuration?.(course) || "—";
    } catch {
      return "—";
    }
  };

  /* -----------------------------------------
      REMOVE ENROLLMENT FUNCTION
  --------------------------------------------*/
  const handleRemove = async (courseId) => {
    const confirmRemove = window.confirm(
      "Remove this course from your enrollments?"
    );
    if (!confirmRemove) return;

    try {
      const token = await getToken();

      const { data } = await axios.delete(
        `${backendUrl}/api/user/remove-enrollment/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Enrollment removed!");

        // Refresh enrolled courses
        fetchUserEnrolledCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* -----------------------------------------
      FETCH PROGRESS
  --------------------------------------------*/
  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setProgressArray([]);
        return;
      }

      const results = await Promise.all(
        (enrolledCourses || []).map(async (course) => {
          const totalLectures = calculateNoOfLectures?.(course) || 0;

          const { data } = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const completed = data?.progressData?.lectureCompleted?.length || 0;
          return { totalLectures, completed };
        })
      );

      setProgressArray(results);
    } catch (error) {
      console.error("Progress Fetch Error:", error);
      toast.error(error.message || "Failed to fetch course progress");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (userData) await fetchUserEnrolledCourses();
      } catch {}
      finally {
        setLoading(false);
      }
    })();
  }, [userData]);

  useEffect(() => {
    if (enrolledCourses?.length > 0) {
      getCourseProgress();
    } else {
      setProgressArray([]);
    }
  }, [enrolledCourses]);

  /* ================== LOADING ================== */
  if (loading) {
    return (
      <div className="md:px-36 px-8 pt-10">
        <h1 className="text-3xl font-semibold">My Enrollments</h1>
        <div className="mt-10 text-gray-500 animate-pulse">
          Fetching your courses…
        </div>
      </div>
    );
  }

  /* ================== EMPTY STATE ================== */
  if (!Array.isArray(enrolledCourses) || enrolledCourses.length === 0) {
    return (
      <>
        <div className="md:px-36 px-8 pt-10">
          <h1 className="text-3xl font-semibold">My Enrollments</h1>
          <div className="flex flex-col items-center justify-center h-72 text-gray-500 mt-10 border rounded-xl shadow-inner bg-gray-50/60">
            <img src={fallbackThumb} alt="No courses" className="w-20 opacity-70 mb-4" />
            <p className="text-xl font-semibold">No enrollments yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Explore courses to begin your learning journey.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* ================== MAIN UI ================== */
  return (
    <>
      <div className="md:px-36 px-8 pt-10 pb-10">
        <h1 className="text-3xl font-semibold">My Enrollments</h1>

        <div className="mt-10 flex flex-col space-y-5">
          {(enrolledCourses || []).map((course, index) => {
            if (!course) return null;

            const progress = progressArray[index] || {
              totalLectures: 0,
              completed: 0,
            };

            const percent = safePercent(progress.completed, progress.totalLectures);
            const done =
              progress.totalLectures > 0 &&
              progress.completed >= progress.totalLectures;

            const uniqueKey =
              `${course._id || "course"}-${course.courseTitle || "title"}-${index}`;

            return (
              <div
                key={uniqueKey}
                className="flex flex-col md:flex-row items-start md:items-center gap-5 p-5 rounded-2xl bg-white/60 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-200"
              >

                {/* Thumbnail */}
                <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden bg-gray-200 shadow-md">
                  <img
                    src={resolveThumb(course.courseThumbnail)}
                    alt={course.courseTitle}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 w-full">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {course.courseTitle}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Duration: {safeCourseDuration(course)}
                  </p>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="w-full h-3 bg-gray-300/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-600"
                        style={{
                          width: `${percent}%`,
                          transition: "width 600ms ease",
                        }}
                      ></div>
                    </div>

                    <p className="text-xs mt-1 text-gray-600">
                      {progress.completed} / {progress.totalLectures} Lectures
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="w-full md:w-auto flex items-center gap-3">

                  {/* Continue */}
                  <button
                    onClick={() => navigate("/player/" + course._id)}
                    className={`px-6 py-3 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all ${
                      done
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {done ? "Completed" : "Continue"}
                  </button>

                  {/* REMOVE BUTTON */}
                  <button
                    onClick={() => handleRemove(course._id)}
                    className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition shadow-sm"
                    title="Remove Enrollment"
                  >
                    ✕
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default MyEnrollments;

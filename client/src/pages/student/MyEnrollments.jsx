/* eslint-disable no-unused-vars */
import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import Footer from "../../components/student/Footer";
import { toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";

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
  } = useContext(AppContext);

  const { user } = useUser();

  const [progressArray, setProgressArray] = useState([]);
  const [hiddenCourses, setHiddenCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ENROLLMENTS ================= */
  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        if (userData) {
          const token = await getToken();

          const res = await axios.get(
            `${backendUrl}/api/user/enrolled-courses`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.data.success) {
            setHiddenCourses(res.data.hiddenCourses || []);
          }

          await fetchUserEnrolledCourses();
        }
      } catch (err) {
        console.error("Enrollment fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  /* ================= FETCH PROGRESS ================= */
  useEffect(() => {
    if (!user || !enrolledCourses?.length) {
      setProgressArray([]);
      return;
    }

    const getCourseProgress = async () => {
      try {
        const token = await getToken();

        const results = await Promise.all(
          enrolledCourses.map(async (course) => {
            const { data } = await axios.get(
              `${backendUrl}/api/progress/${user.id}/${course._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            return {
              percentage: data?.progressPercentage || 0,
              isCompleted: data?.completed || false,
            };
          })
        );

        setProgressArray(results);
      } catch (err) {
        console.error("Progress fetch error:", err);
        toast.error("Failed to fetch course progress");
      }
    };

    getCourseProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrolledCourses, user]);

  /* ================= REMOVE COURSE ================= */
  const handleRemoveCourse = async (courseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this course?"
    );

    if (!confirmDelete) return;

    try {
      const token = await getToken();

      await axios.delete(
        `${backendUrl}/api/user/remove-enrollment/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Course removed successfully");

      // 🔥 REFRESH UI
      await fetchUserEnrolledCourses();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove course");
    }
  };

  /* ================= HIDE COURSE ================= */
  const handleHide = async (courseId) => {
    try {
      const token = await getToken();

      await axios.post(
        `${backendUrl}/api/user/hide-course`,
        { courseId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHiddenCourses((prev) => [...prev, courseId]);

      toast.success("Course hidden");
    } catch (error) {
      console.error(error);
      toast.error("Failed to hide course");
    }
  };

  /* ================= UNHIDE COURSE ================= */
  const handleUnhide = async (courseId) => {
    try {
      const token = await getToken();

      await axios.post(
        `${backendUrl}/api/user/unhide-course`,
        { courseId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHiddenCourses((prev) =>
        prev.filter((id) => id !== courseId)
      );

      toast.success("Course restored");
    } catch (error) {
      console.error(error);
      toast.error("Failed to restore course");
    }
  };

  /* ================= FILTER ================= */
  const visibleCourses = enrolledCourses.filter(
    (course) => !hiddenCourses.includes(course._id)
  );

  const hiddenCoursesList = enrolledCourses.filter((course) =>
    hiddenCourses.includes(course._id)
  );

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

  return (
    <>
      <div className="md:px-36 px-8 pt-10 pb-10">
        <h1 className="text-3xl font-semibold">My Enrollments</h1>

        <div className="mt-10 flex flex-col space-y-5">
          {visibleCourses.map((course, index) => {
            const progress = progressArray[index] || {
              percentage: 0,
              isCompleted: false,
            };

            return (
              <div
                key={course._id}
                className="flex flex-col md:flex-row items-center gap-5 p-5 rounded-2xl bg-white shadow border"
              >
                <img
                  src={resolveThumb(course.thumbnail)}
                  className="w-40 h-28 object-cover rounded"
                />

                <div className="flex-1">
                  <h2 className="font-semibold text-lg">
                    {course.courseTitle}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Duration: {calculateCourseDuration(course)}
                  </p>

                  <p className="text-sm mt-2">
                    {progress.percentage}% Completed
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate("/player/" + course._id)}
                    className="px-5 py-2 bg-blue-600 text-white rounded"
                  >
                    Continue
                  </button>

                  <button
                    onClick={() => handleHide(course._id)}
                    className="px-5 py-2 bg-yellow-500 text-white rounded"
                  >
                    Hide
                  </button>

                  {/* 🔥 NEW REMOVE BUTTON */}
                  <button
                    onClick={() => handleRemoveCourse(course._id)}
                    className="px-5 py-2 bg-red-600 text-white rounded"
                  >
                    Remove ❌
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
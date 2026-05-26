import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";

const MyCourses = () => {
  const { backendUrl, isEducator, currency, getToken } =
    useContext(AppContext);

  const [courses, setCourses] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch educator courses
  const fetchEducatorCourses = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        toast.error(
          "Authorization token missing. Please login again."
        );
        return;
      }

      const { data } = await axios.get(
        `${backendUrl}/api/educator/courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setCourses(data.courses);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED DELETE FUNCTION
  const handleDeleteCourse = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this course?"
      )
    )
      return;

    try {
      const token = await getToken();

      const { data } = await axios.delete(
        `${backendUrl}/api/educator/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);

        // remove deleted course instantly
        setCourses((prev) =>
          prev.filter(
            (course) =>
              course._id !== id
          )
        );

        // 🔥 refresh leaderboard instantly
        window.dispatchEvent(
          new Event(
            "leaderboardUpdated"
          )
        );

      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(
        "Failed to delete course"
      );
    }
  };

  useEffect(() => {
    if (isEducator) {
      fetchEducatorCourses();
    } else {
      setLoading(false);
    }
  }, [isEducator]);

  if (loading) return <Loading />;

  if (!courses || courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        No courses found
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">

      <h1 className="text-2xl font-bold mb-6">
        My Courses
      </h1>

      {courses.map((course) => (
        <div
          key={course._id}
          className="bg-white p-4 mb-4 rounded shadow flex justify-between items-center"
        >
          <div>
            <h2 className="font-semibold">
              {course.courseTitle}
            </h2>

            <p>
              {currency}
              {course.coursePrice}
            </p>
          </div>

          <button
            onClick={() =>
              handleDeleteCourse(
                course._id
              )
            }
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete
          </button>

        </div>
      ))}
    </div>
  );
};

export default MyCourses;
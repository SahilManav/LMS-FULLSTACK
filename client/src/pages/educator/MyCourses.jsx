import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";

const MyCourses = () => {
  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch educator courses (correct API)
  const fetchEducatorCourses = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        toast.error("Authorization token missing. Please log in again.");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(
        `${backendUrl}/api/educator/courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setCourses(data.courses);
      } else {
        toast.error(data.message || "Failed to load courses.");
      }
    } catch (error) {
      console.error("Error fetching educator courses:", error);
      toast.error("Failed to fetch courses. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete a course (correct API)
  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const token = await getToken();

      const { data } = await axios.delete(
        `${backendUrl}/api/educator/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setCourses((prev) => prev.filter((course) => course._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course.");
    }
  };

  // Fetch when educator logs in
  useEffect(() => {
    if (isEducator) {
      fetchEducatorCourses();
    } else {
      setLoading(false);
    }
  }, [isEducator]);

  // Loading UI
  if (loading) return <Loading />;

  // No courses
  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
          alt="No courses"
          className="w-24 mb-4 opacity-70"
        />
        <p className="text-lg font-medium">No courses found.</p>
        <p className="text-sm text-gray-400">
          Start by creating your first course!
        </p>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen flex flex-col items-start justify-start md:p-8 p-4 pt-8 bg-gray-50">
      <div className="w-full">
        <h2 className="pb-4 text-lg font-semibold text-gray-800">
          My Courses
        </h2>

        <div className="flex flex-col items-center max-w-5xl w-full overflow-hidden rounded-lg bg-white border border-gray-300 shadow">
          <table className="table-auto w-full">
            <thead className="text-gray-900 border-b border-gray-200 text-sm text-left bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Earnings</th>
                <th className="px-4 py-3 font-semibold">Students</th>
                <th className="px-4 py-3 font-semibold">Published On</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {courses.map((course) => {
                const imageUrl =
                  course.effectiveThumbnail ||
                  course.thumbnail ||
                  course.courseThumbnail ||
                  "https://cdn-icons-png.flaticon.com/512/4076/4076549.png";

                const earnings =
                  typeof course.earnings === "number"
                    ? course.earnings
                    : 0;

                const totalStudents =
                  course.totalStudents ??
                  course.enrolledStudents?.length ??
                  0;

                return (
                  <tr
                    key={course._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 flex items-center space-x-3">
                      <img
                        src={imageUrl}
                        alt="Course"
                        className="w-14 h-14 rounded object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {course.courseTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {course.category || "Uncategorized"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {currency || "₹"} {earnings.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {totalStudents}
                    </td>
                    <td className="px-4 py-3">
                      {course.createdAt
                        ? new Date(course.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 px-3 rounded transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;

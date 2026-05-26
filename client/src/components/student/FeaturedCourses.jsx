import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const FeaturedCourses = ({ limit = 6 }) => {
  const { allCourses, navigate } = useContext(AppContext);

  if (!allCourses || allCourses.length === 0) return null;

  // pick top N by rating or studentsCount
  const featured = [...allCourses]
    .sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0))
    .slice(0, limit);

  return (
    <section className="w-full max-w-6xl mt-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Featured Courses</h3>
        <p className="text-sm text-gray-500">Handpicked for you</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition transform hover:-translate-y-2"
          >
            <div className="flex gap-4">
              <img src={course.courseThumbnail} alt={course.courseTitle} className="w-28 h-20 object-cover rounded" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold">{course.courseTitle}</h4>
                <div className="text-sm text-gray-500 mt-1">
                  {course.instructorName || course.author || "Instructor"}
                </div>
                <div className="mt-2 text-sm text-gray-600 flex items-center justify-between">
                  <div>{(course.duration && `${course.duration}`) || "—"}</div>
                  <div>{(course.studentsCount || 0).toLocaleString()} learners</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => navigate(`/course/${course._id}`)}
                className="text-sm px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                View course
              </button>

              <button
                onClick={() => navigate(`/player/${course._id}`)}
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Start
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCourses;

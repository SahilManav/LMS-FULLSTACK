// client/src/components/student/RecommendedCourses.jsx
import React, { useContext, useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import { AppContext } from "../../context/AppContext";

const RecommendedCourses = ({ currentCourseId }) => {
  const { allCourses } = useContext(AppContext);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    if (!allCourses || allCourses.length === 0) return;

    // Filter out current course + pick random 4
    const filtered = allCourses.filter(
      (c) => c._id !== currentCourseId && c.courseCategory === "programming"
    );

    // If backend has no category, fallback to any 4 random
    const finalList =
      filtered.length > 0
        ? filtered
        : allCourses.filter((c) => c._id !== currentCourseId);

    setRecommended(finalList.slice(0, 4));
  }, [allCourses, currentCourseId]);

  if (!recommended.length) return null;

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Recommended Courses
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommended.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedCourses;

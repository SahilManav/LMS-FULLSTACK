import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { MdPlayArrow } from "react-icons/md";

const ContinueCarousel = () => {
  const { enrolledCourses, navigate } = useContext(AppContext);

  // Automatically slide every 3 seconds
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (enrolledCourses.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % enrolledCourses.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [enrolledCourses]);

  if (!enrolledCourses || enrolledCourses.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center mt-10 mb-5">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">
        Continue Learning
      </h2>

      <div className="relative w-full max-w-5xl h-56 md:h-64 overflow-hidden rounded-xl shadow-lg">

        {/* Slider Wrapper */}
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${index * 100}%)`,
          }}
        >
          {enrolledCourses.map((course, i) => (
            <div
              key={i}
              className="min-w-full flex items-center gap-6 bg-white p-6 rounded-xl"
            >
              {/* Thumbnail */}
              <img
                src={course.courseThumbnail}
                alt={course.courseTitle}
                className="w-32 h-32 object-cover rounded-lg shadow-md"
              />

              {/* Info */}
              <div className="flex flex-col flex-1 items-start">
                <h3 className="text-xl font-semibold">{course.courseTitle}</h3>
                <p className="text-gray-500 text-sm mb-1">
                  {course.courseContent?.length || 0} Lectures
                </p>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-lg overflow-hidden mb-3">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{
                      width: `${
                        course.progress
                          ? Math.min(course.progress, 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={() => navigate(`/player/${course._id}`)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
                >
                  <MdPlayArrow size={22} />
                  Continue
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {enrolledCourses.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                index === i ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContinueCarousel;

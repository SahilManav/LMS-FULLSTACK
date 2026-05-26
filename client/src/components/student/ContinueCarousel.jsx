import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { MdPlayArrow } from "react-icons/md";

const fallbackThumb =
  "https://cdn-icons-png.flaticon.com/512/4076/4076549.png";

const ContinueCarousel = () => {
  const { enrolledCourses, navigate } =
    useContext(AppContext);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enrolledCourses?.length) return;

    const interval = setInterval(() => {
      setIndex(
        (prev) =>
          (prev + 1) %
          enrolledCourses.length
      );
    }, 3500);

    return () =>
      clearInterval(interval);
  }, [enrolledCourses]);

  if (!enrolledCourses?.length)
    return null;

  return (
    <div className="w-full flex flex-col items-center mt-10 mb-5">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">
        Continue Learning
      </h2>

      <div className="relative w-full max-w-5xl h-56 md:h-64 overflow-hidden rounded-xl shadow-lg">

        <div
          className="flex transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${index * 100}%)`,
          }}
        >
          {enrolledCourses.map(
            (course) => {
              const totalLectures =
                course.totalLectures ||
                course.courseContent?.reduce(
                  (
                    sum,
                    chapter
                  ) =>
                    sum +
                    (
                      chapter
                        ?.chapterContent
                        ?.length || 0
                    ),
                  0
                ) ||
                0;

              const completedLectures =
                course
                  ?.completedLectures
                  ?.length || 0;

              const progress =
                course.progress ||
                (
                  totalLectures > 0
                    ? Math.round(
                        (
                          completedLectures /
                          totalLectures
                        ) *
                          100
                      )
                    : 0
                );

              const thumb =
                course.courseThumbnail ||
                course.thumbnail ||
                course.effectiveThumbnail ||
                fallbackThumb;

              return (
                <div
                  key={
                    course._id
                  }
                  className="min-w-full flex items-center gap-6 bg-white p-6 rounded-xl"
                >
                  {/* image */}
                  <img
                    src={
                      thumb
                    }
                    alt={
                      course.courseTitle
                    }
                    className="w-32 h-32 object-cover rounded-lg shadow"
                  />

                  {/* content */}
                  <div className="flex flex-col flex-1 items-start">
                    <h3 className="text-xl font-semibold">
                      {
                        course.courseTitle
                      }
                    </h3>

                    <p className="text-gray-500 text-sm mb-1">
                      {
                        totalLectures
                      }{" "}
                      Lectures
                    </p>

                    <p className="text-sm text-gray-500 mb-2">
                      Progress:{" "}
                      {
                        progress
                      }
                      %
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-lg overflow-hidden mb-4">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/player/${course._id}`
                        )
                      }
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      <MdPlayArrow size={22} />
                      Continue
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};

export default ContinueCarousel;
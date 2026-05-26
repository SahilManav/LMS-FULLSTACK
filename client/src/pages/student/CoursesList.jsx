/* eslint-disable no-unused-vars */
// client/src/pages/student/CoursesList.jsx

import React, { useContext, useEffect, useState } from "react";
import Footer from "../../components/student/Footer";
import { assets } from "../../assets/assets";
import CourseCard from "../../components/student/CourseCard";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import SearchBar from "../../components/student/SearchBar";

const CoursesList = () => {
  const { input } = useParams();
  const { allCourses, navigate } = useContext(AppContext);

  const [filteredCourse, setFilteredCourse] = useState([]);

  useEffect(() => {
    if (allCourses?.length > 0) {
      if (input) {
        const filtered = allCourses.filter((item) => {
          const title =
            item.courseTitle?.toLowerCase() || "";

          const category =
            (
              item.courseCategory ||
              item.category ||
              ""
            ).toLowerCase();

          const search = input.toLowerCase();

          return (
            title.includes(search) ||
            category.includes(search)
          );
        });

        setFilteredCourse(filtered);
      } else {
        setFilteredCourse(allCourses);
      }
    }
  }, [allCourses, input]);

  return (
    <>
      <div className="relative md:px-36 px-8 pt-20 text-left">

        <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">

          <div>
            <h1 className="text-4xl font-semibold text-gray-800">
              Course List
            </h1>

            <p className="text-gray-500">
              <span
                onClick={() => navigate("/")}
                className="text-blue-600 cursor-pointer"
              >
                Home
              </span>

              {" / "}
              <span>Course List</span>
            </p>
          </div>

          <SearchBar data={input} />
        </div>

        {input && (
          <div className="inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600">
            <p>{input}</p>

            <img
              onClick={() =>
                navigate("/course-list")
              }
              className="cursor-pointer"
              src={assets.cross_icon}
              alt=""
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-6 px-2 md:p-0">

          {filteredCourse.length > 0 ? (
            filteredCourse.map(
              (course, index) => (
                <div
                  key={course._id || index}
                  className="animate-fade-in"
                >
                  <CourseCard
                    course={course}
                  />
                </div>
              )
            )
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              No courses found.
            </p>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
};

export default CoursesList;
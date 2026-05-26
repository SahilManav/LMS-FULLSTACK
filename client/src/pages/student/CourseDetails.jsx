/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import Footer from "../../components/student/Footer";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";
import Loading from "../../components/student/Loading";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});

  const { backendUrl, currency, userData, addToCart, cart } =
    useContext(AppContext);

  const { getToken } = useAuth();

  const isInCart = cart.some(
    (c) => c._id === courseData?._id
  );

  // ================= FETCH =================
  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/course/details/${id}`
      );

      if (!data.success)
        return toast.error(data.message);

      setCourseData(data.courseData);
    } catch (err) {
      toast.error("Failed to load course");
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  if (!courseData) return <Loading />;

  // ================= PREVIEW =================
  const previewLecture = courseData.courseContent
    ?.flatMap((ch) => ch.chapterContent)
    ?.find((lec) => lec.isPreviewFree);

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";

    // youtube watch link
    if (url.includes("watch?v=")) {
      const videoId = url
        .split("watch?v=")[1]
        ?.split("&")[0];

      return `https://www.youtube.com/embed/${videoId}`;
    }

    // short youtu.be
    if (url.includes("youtu.be/")) {
      const videoId = url
        .split("youtu.be/")[1]
        ?.split("?")[0];

      return `https://www.youtube.com/embed/${videoId}`;
    }

    // already embed link
    if (url.includes("/embed/")) {
      return url;
    }

    return url;
  };

  const previewUrl = getYoutubeEmbedUrl(
    previewLecture?.lectureUrl
  );

  // ================= ENROLL =================
  const enrollCourse = () => {
    if (!userData) {
      toast.warn("Please login first.");
      return;
    }

    if (!isInCart) {
      addToCart(courseData);
    }

    navigate("/cart");
  };

  return (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-12 md:px-36 px-6 md:pt-20 pt-10">

        {/* LEFT */}
        <div className="flex-1 text-gray-700">

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {courseData.courseTitle}
          </h1>

          <p className="text-sm mt-2">
            Course by{" "}
            <span className="text-blue-600 underline">
              {courseData.educator?.name ||
                "Instructor"}
            </span>
          </p>

          {/* PREVIEW */}
          <div className="pt-6">

            <h2 className="text-xl font-semibold">
              Free Preview
            </h2>

            {previewLecture ? (
              <iframe
                className="w-full h-64 md:h-80 mt-3 rounded-lg shadow"
                src={previewUrl}
                title="Course Preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-64 md:h-80 mt-3 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                No Preview Available
              </div>
            )}

          </div>

          {/* DESCRIPTION */}
          <div className="pt-6">

            <h2 className="text-xl font-semibold">
              Description
            </h2>

            <div
              className="text-sm mt-2 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  courseData.courseDescription ||
                  "No description available",
              }}
            />

          </div>

          {/* REQUIREMENTS */}
          <div className="pt-6">

            <h2 className="text-xl font-semibold">
              Requirements
            </h2>

            <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
              {courseData.requirements?.length ? (
                courseData.requirements.map(
                  (item, i) => (
                    <li key={i}>
                      {item}
                    </li>
                  )
                )
              ) : (
                <li>
                  No requirements listed
                </li>
              )}
            </ul>

          </div>

          {/* LEARN */}
          <div className="pt-6">

            <h2 className="text-xl font-semibold">
              What You'll Learn
            </h2>

            <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
              {courseData.whatYouWillLearn
                ?.length ? (
                courseData.whatYouWillLearn.map(
                  (item, i) => (
                    <li key={i}>
                      {item}
                    </li>
                  )
                )
              ) : (
                <li>
                  No learning outcomes available
                </li>
              )}
            </ul>

          </div>

          {/* STRUCTURE */}
          <div className="pt-8">

            <h2 className="text-xl font-semibold">
              Course Structure
            </h2>

            {courseData.courseContent?.map(
              (chapter, index) => (
                <div
                  key={index}
                  className="border rounded mt-3 overflow-hidden"
                >

                  <div
                    className="p-3 bg-gray-100 cursor-pointer font-medium hover:bg-gray-200"
                    onClick={() =>
                      setOpenSections(
                        (prev) => ({
                          ...prev,
                          [index]:
                            !prev[index],
                        })
                      )
                    }
                  >
                    {
                      chapter.chapterTitle
                    }
                  </div>

                  {openSections[index] && (
                    <ul className="pl-6 pb-3 text-sm">

                      {chapter.chapterContent.map(
                        (
                          lecture,
                          i
                        ) => (
                          <li
                            key={i}
                            className="py-1"
                          >
                            •{" "}
                            {
                              lecture.lectureTitle
                            }

                            {lecture.isPreviewFree && (
                              <span className="text-green-600 ml-2">
                                (Preview)
                              </span>
                            )}
                          </li>
                        )
                      )}

                    </ul>
                  )}

                </div>
              )
            )}

          </div>

        </div>

        {/* RIGHT */}
        <div className="w-full md:w-[350px]">

          <div className="bg-white rounded-xl shadow-xl overflow-hidden sticky top-24">

            <img
              src={courseData.thumbnail}
              className="w-full h-[200px] object-cover"
              alt=""
            />

            <div className="p-5">

              <p className="text-3xl font-bold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount *
                    courseData.coursePrice) /
                    100
                ).toFixed(2)}
              </p>

              <button
                onClick={enrollCourse}
                className="mt-5 w-full py-3 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Enroll Now
              </button>

              <button
                onClick={() =>
                  addToCart(courseData)
                }
                disabled={isInCart}
                className="mt-3 w-full py-3 rounded border"
              >
                {isInCart
                  ? "Added To Cart"
                  : "Add To Cart"}
              </button>

            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
};

export default CourseDetails;
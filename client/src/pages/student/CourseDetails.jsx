// client/src/pages/student/CourseDetails.jsx

import React, { useContext, useEffect, useState } from "react";
import Footer from "../../components/student/Footer";
import { assets } from "../../assets/assets";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import { useAuth } from "@clerk/clerk-react";
import Loading from "../../components/student/Loading";
import RecommendedCourses from "../../components/student/RecommendedCourses";

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [wishlisted, setWishlisted] = useState(false);

  const {
    backendUrl,
    currency,
    userData,
    calculateChapterTime,
    calculateCourseDuration,
    calculateRating,
    calculateNoOfLectures,
    addToCart,
    cart,
  } = useContext(AppContext);

  const { getToken } = useAuth();

  /* ===========================================
     CHECK IF IN CART
  ============================================ */
  const isInCart = cart.some((c) => c._id === courseData?._id);

  /* ===========================================
     FETCH COURSE DETAILS
  ============================================ */
  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/details/${id}`);

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      const course = data.courseData;
      setCourseData(course);

      // wishlist status
      const list = JSON.parse(localStorage.getItem("wish") || "[]");
      setWishlisted(list.includes(course._id));

    } catch (err) {
      toast.error("Failed to load course details");
    }
  };

  /* ===========================================
     STRIPE → ENROLL (PAID)
  ============================================ */
  const enrollCourse = async () => {
    try {
      if (!userData) return toast.warn("Please login first.");

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        { courseId: courseData._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      // Stripe checkout redirect
      window.location.href = data.session_url;

    } catch (err) {
      toast.error(err.response?.data?.message || "Error enrolling course");
    }
  };

  /* ===========================================
     TOGGLE WISHLIST
  ============================================ */
  const toggleWishlist = () => {
    let list = JSON.parse(localStorage.getItem("wish") || "[]");

    if (list.includes(courseData._id)) {
      list = list.filter((id) => id !== courseData._id);
      setWishlisted(false);
    } else {
      list.push(courseData._id);
      setWishlisted(true);
    }

    localStorage.setItem("wish", JSON.stringify(list));
  };

  /* ===========================================
     EFFECTS
  ============================================ */
  useEffect(() => {
    fetchCourseData();
  }, []);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!courseData) return <Loading />;

  return (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-20 pt-10 text-left">

        {/* LEFT SECTION */}
        <div className="max-w-xl z-10 text-gray-600">

          <h1 className="md:text-4xl text-3xl font-semibold text-gray-900">
            {courseData.courseTitle}
          </h1>

          {/* Rating */}
          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{calculateRating(courseData)}</p>

            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={
                    i < Math.floor(calculateRating(courseData))
                      ? assets.star
                      : assets.star_blank
                  }
                  className="w-4 h-4"
                />
              ))}
            </div>

            <p className="text-blue-600">
              ({courseData.courseRatings.length} ratings)
            </p>
          </div>

          <p className="text-sm">
            Course by{" "}
            <span className="text-blue-600 underline">
              {courseData.educator?.name}
            </span>
          </p>

          {/* COURSE STRUCTURE */}
          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>

            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => (
                <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={assets.down_arrow_icon}
                        className={`transition-transform ${openSections[index] ? "rotate-180" : ""}`}
                      />
                      <p className="font-medium">{chapter.chapterTitle}</p>
                    </div>

                    <p className="text-sm">
                      {chapter.chapterContent.length} lectures ·{" "}
                      {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSections[index] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="list-disc pl-10 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="py-1 flex justify-between text-sm">
                          {lecture.lectureTitle}
                          <span className="text-gray-500">
                            {humanizeDuration(
                              lecture.lectureDuration * 60 * 1000,
                              { units: ["h", "m"] }
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="py-16 text-sm">
            <h3 className="text-xl font-semibold text-gray-800">
              Course Description
            </h3>
            <p
              className="mt-3 text-gray-700"
              dangerouslySetInnerHTML={{
                __html: courseData.courseDescription,
              }}
            ></p>
          </div>

          <RecommendedCourses currentCourseId={id} />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="max-w-course-card z-10 shadow-xl rounded overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">

          {/* THUMBNAIL */}
          <img
            src={courseData.thumbnail || courseData.courseThumbnail}
            className="w-full"
          />

          <div className="p-5">

            {/* PRICE */}
            <div className="flex gap-3 items-center">
              <p className="text-gray-900 text-3xl font-semibold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100
                ).toFixed(2)}
              </p>

              <p className="text-gray-500 line-through">
                {currency}
                {courseData.coursePrice}
              </p>

              <p className="text-gray-500">{courseData.discount}% off</p>
            </div>

            {/* META */}
            <div className="flex items-center text-sm gap-4 pt-3 text-gray-600">
              <span className="flex items-center gap-1">
                <img src={assets.clock} className="w-4" />
                {calculateCourseDuration(courseData)}
              </span>

              <span className="flex items-center gap-1">
                <img src={assets.video} className="w-4" />
                {calculateNoOfLectures(courseData)} lessons
              </span>
            </div>

            {/* ⭐ ENROLL (STRIPE) */}
            <button
              onClick={enrollCourse}
              className="mt-5 w-full py-3 rounded bg-blue-600 text-white font-medium"
            >
              Enroll Now
            </button>

            {/* ADD TO CART */}
            <button
              onClick={() => addToCart(courseData)}
              disabled={isInCart}
              className={`mt-3 w-full py-3 rounded border font-medium flex items-center justify-center gap-2 transition
                ${isInCart ? "bg-blue-600 text-white cursor-not-allowed" : "hover:bg-gray-100"}`}
            >
              <img src={assets.cart} className="w-5" />
              {isInCart ? "Added to Cart" : "Add to Cart"}
            </button>

            {/* WISHLIST */}
            <button
              onClick={toggleWishlist}
              className="mt-3 w-full py-3 rounded border font-medium flex items-center justify-center gap-2"
            >
              <img
                src={wishlisted ? assets.heart_filled : assets.heart}
                className="w-5"
              />
              {wishlisted ? "Wishlisted" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CourseDetails;

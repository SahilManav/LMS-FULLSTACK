/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const fallbackThumb =
  "https://cdn-icons-png.flaticon.com/512/4076/4076549.png";

const CourseCard = ({ course = {} }) => {
  const {
    currency,
    calculateRating,
    calculateCourseDuration,
    calculateNoOfLectures,
    cart,
    addToCart,
  } = useContext(AppContext);

  // 🔥 SAFE IMAGE LOGIC (UPDATED — NOTHING REMOVED)
  const rawThumb =
    course?.effectiveThumbnail ||
    course?.thumbnail ||
    fallbackThumb;

  const thumb =
    rawThumb && rawThumb.startsWith("http")
      ? rawThumb
      : fallbackThumb;

  // 🔥 DEBUG (REMOVE LATER)
  console.log("COURSE IMAGE:", rawThumb);

  const rating = calculateRating?.(course) || 0;
  const ratingCount = course.courseRatings?.length || 0;
  const educatorName = course.educator?.name || "Unknown Educator";

  const priceNum = Number(course.coursePrice || 0);
  const discountedPrice =
    course.coursePrice && typeof course.discount === "number"
      ? (priceNum - (course.discount * priceNum) / 100).toFixed(2)
      : priceNum.toFixed(2);

  const duration = calculateCourseDuration?.(course) || "0 hr";
  const lectures = calculateNoOfLectures?.(course) || 0;
  const students = course.enrolledStudents?.length || 0;

  const [wishlisted, setWishlisted] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("wish") || "[]");
    setWishlisted(list.includes(course._id));
  }, [course._id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let list = JSON.parse(localStorage.getItem("wish") || "[]");
    if (list.includes(course._id)) {
      list = list.filter((id) => id !== course._id);
      setWishlisted(false);
    } else {
      list.push(course._id);
      setWishlisted(true);
    }
    localStorage.setItem("wish", JSON.stringify(list));
  };

  const isInCart = cart?.some((c) => c?._id === course._id);
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(course);
  };

  const descriptionPreview =
    course.courseDescription?.replace(/<[^>]+>/g, "") || "";

  const previewText =
    descriptionPreview.length > 140
      ? descriptionPreview.slice(0, 140) + "…"
      : descriptionPreview;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        to={`/course/${course._id}`}
        className="block transition-all duration-150 hover:-translate-y-1 hover:shadow-lg rounded-lg"
        onClick={() => scrollTo(0, 0)}
      >
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <div className="relative">
            <img
              src={thumb}
              alt={course.courseTitle || "course"}
              className="w-full h-44 object-cover"
            />

            <button
              onClick={toggleWishlist}
              className="absolute right-3 top-3 bg-white/90 p-2 rounded-full shadow hover:scale-110 transition"
            >
              <img
                src={wishlisted ? assets.heart_filled : assets.heart}
                className="w-5"
                alt=""
              />
            </button>
          </div>

          <div className="p-3 text-left">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
              {course.courseTitle}
            </h3>

            <p className="text-xs text-gray-500 mt-1">{educatorName}</p>

            <div className="flex items-center gap-3 mt-3 text-gray-600 text-xs">
              <span className="flex items-center gap-1">
                <img src={assets.clock} className="w-4" /> {duration}
              </span>
              <span className="flex items-center gap-1">
                <img src={assets.video} className="w-4" /> {lectures}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm font-medium">{rating.toFixed(1)}</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={i < Math.floor(rating) ? assets.star : assets.star_blank}
                    className="w-3.5 h-3.5"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({ratingCount})</span>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="font-semibold">
                {currency}
                {discountedPrice}
              </p>

              <button
                onClick={handleAddToCart}
                className={`p-2 rounded-lg ${
                  isInCart
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {isInCart ? "Added" : <img src={assets.cart} className="w-5" />}
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* PREVIEW */}
      <div
        className={`absolute left-full top-20 ml-4 w-72
        bg-white border rounded-xl shadow-2xl p-3 z-40
        transition-all duration-100
        ${hover ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"}
        hidden lg:block`}
      >
        <img
          src={thumb}
          alt=""
          className="w-full h-28 object-cover rounded-lg mb-2"
        />

        <h4 className="font-semibold text-sm line-clamp-2">
          {course.courseTitle}
        </h4>

        <p className="text-xs text-gray-500 mb-2">
          {educatorName} • {course.category || "General"}
        </p>

        <p className="text-xs text-gray-700 mb-3 line-clamp-3">
          {previewText}
        </p>

        <div className="space-y-1 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <img src={assets.clock} className="w-3.5" />
            <span>{duration}</span>
          </div>

          <div className="flex items-center gap-2">
            <img src={assets.video} className="w-3.5" />
            <span>{lectures} lectures</span>
          </div>

          <div className="flex items-center gap-2">
            <img src={assets.students} className="w-3.5" />
            <span>{students} students</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t">
          <p className="font-semibold text-sm">
            {currency}
            {discountedPrice}
          </p>

          <Link
            to={`/course/${course._id}`}
            className="text-blue-600 text-xs font-medium hover:underline"
            onClick={() => scrollTo(0, 0)}
          >
            View course details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
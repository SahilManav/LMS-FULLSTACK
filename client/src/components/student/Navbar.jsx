/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect, useRef } from "react";
import { assets } from "../../assets/assets";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useClerk, useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import {
  MdKeyboardArrowDown,
  MdNotifications,
} from "react-icons/md";

const Navbar = () => {
  const location = useLocation();
  const isCoursesListPage = location.pathname.includes("/course-list");

  const {
    backendUrl,
    isEducator,
    navigate,
    allCourses,
  } = useContext(AppContext);

  const { openSignIn, signOut } = useClerk();
  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();

  const [showExplore, setShowExplore] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [categories, setCategories] = useState([]);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  /* ================= TOKEN ================= */
  useEffect(() => {
    const setToken = async () => {
      if (isSignedIn) {
        const token = await getToken();
        localStorage.setItem("token", token);
      }
    };
    setToken();
  }, [isSignedIn]);

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    if (isSignedIn) fetchUpcomingClasses();
  }, [isSignedIn]);

  /* ================= DYNAMIC CATEGORIES ================= */
  useEffect(() => {
    if (allCourses?.length) {
      const uniqueCategories = [
        ...new Set(
          allCourses
            .map((course) => course.courseCategory || course.category)
            .filter(Boolean)
        ),
      ];

      setCategories(uniqueCategories);
    }
  }, [allCourses]);

  const fetchUpcomingClasses = async () => {
    try {
      const token = await getToken();

      const res = await axios.get(
        `${backendUrl}/api/classroom/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let allClasses = [];

      res.data.classrooms.forEach((cls) => {
        cls.liveClasses?.forEach((live) => {
          if (new Date(live.date) >= new Date()) {
            allClasses.push({
              title: live.title,
              date: live.date,
              meetLink: live.meetLink,
              classroom: cls.title,
            });
          }
        });
      });

      allClasses.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setUpcomingClasses(allClasses);

    } catch (err) {
      console.log(err);
    }
  };

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {

      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCoursesListPage
          ? "bg-white"
          : "bg-cyan-100/70"
      }`}
    >
      {/* LOGO */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="w-28 lg:w-32 cursor-pointer"
      />

      {/* NAVBAR */}
      <div className="md:flex hidden items-center gap-6 text-gray-700">

        {/* EXPLORE */}
        <div
          className="relative cursor-pointer"
          onMouseEnter={() =>
            setShowExplore(true)
          }
          onMouseLeave={() =>
            setShowExplore(false)
          }
        >
          <p className="flex items-center gap-1">
            Explore
            <MdKeyboardArrowDown size={18} />
          </p>

          {showExplore && (
            <div className="absolute bg-white shadow-lg rounded-lg w-56 z-50 max-h-72 overflow-y-auto">

              {categories.length > 0 ? (
                categories.map((cat, i) => (
                  <p
                    key={i}
                    onClick={() =>
                      navigate(
                        `/course-list/${cat}`
                      )
                    }
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {cat}
                  </p>
                ))
              ) : (
                <p className="px-3 py-2 text-gray-500">
                  No categories found
                </p>
              )}

            </div>
          )}
        </div>

        <Link to="/">Home</Link>

        <Link to="/course-list">
          Courses
        </Link>

        <Link to="/classroom">
          Classroom
        </Link>

        {/* DASHBOARD */}
        {isEducator && user && (
          <button
            onClick={() =>
              navigate("/educator")
            }
            className="hover:text-blue-600 font-medium"
          >
            Dashboard
          </button>
        )}

        {/* NOTIFICATIONS */}
        {!isEducator && user && (
          <div
            className="relative"
            ref={notificationRef}
          >
            <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
            >
              <MdNotifications size={24} />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg p-4 z-50">

                <h3 className="font-semibold mb-2">
                  Upcoming Classes
                </h3>

                {upcomingClasses.length ===
                0 ? (
                  <p className="text-sm text-gray-500">
                    No upcoming classes
                  </p>
                ) : (
                  upcomingClasses
                    .slice(0, 5)
                    .map((cls, i) => (
                      <div
                        key={i}
                        className="mb-2 border-b pb-2"
                      >
                        <p className="text-sm font-medium">
                          {cls.title}
                        </p>

                        <p className="text-xs text-gray-500">
                          {new Date(
                            cls.date
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {user ? (
          <div
            className="relative"
            ref={profileRef}
          >
            <img
              src={user.imageUrl}
              alt=""
              onClick={() =>
                setShowProfile(
                  !showProfile
                )
              }
              className="w-9 h-9 rounded-full cursor-pointer"
            />

            {showProfile && (
              <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg w-48 z-50">

                <p
                  onClick={() =>
                    navigate("/profile")
                  }
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Profile
                </p>

                <p
                  onClick={() =>
                    navigate("/cart")
                  }
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Cart 🛒
                </p>

                <p
                  onClick={() =>
                    navigate("/my-enrollments")
                  }
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  My Enrollments 🎓
                </p>

                <p
                  onClick={handleLogout}
                  className="px-4 py-2 hover:bg-red-100 text-red-500 cursor-pointer"
                >
                  Logout
                </p>

              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => openSignIn()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
          >
            Login / Signup
          </button>
        )}

      </div>
    </div>
  );
};

export default Navbar;
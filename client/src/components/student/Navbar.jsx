import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import axios from "axios";
import { MdSwapHoriz, MdKeyboardArrowDown } from "react-icons/md";

const Navbar = () => {
  const location = useLocation();
  const isCoursesListPage = location.pathname.includes("/course-list");

  const {
    backendUrl,
    isEducator,
    setIsEducator,
    navigate,
    getToken,
    cart,
    fetchUserData,
  } = useContext(AppContext);

  const { openSignIn } = useClerk();
  const { user } = useUser();

  const [showExplore, setShowExplore] = useState(false);

  const categories = [
    "Web Development",
    "Data Science",
    "AI & Machine Learning",
    "Cyber Security",
    "JavaScript",
    "Python",
    "UI/UX",
    "Business",
    "Design",
  ];

  /* ======================================================
         EDUCATOR ROLE TOGGLE
     ====================================================== */
  const handleEducatorToggle = async () => {
    try {
      const token = await getToken();

      if (isEducator) {
        if (!window.confirm("Switch back to Student?")) return;

        const { data } = await axios.get(
          `${backendUrl}/api/user/remove-educator`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          toast.success("Switched to Student");
          setIsEducator(false);
          fetchUserData();
        }
        return;
      }

      const { data } = await axios.get(
        `${backendUrl}/api/educator/update-role`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("You are now an Educator!");
        setIsEducator(true);
        fetchUserData();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ======================================================
         NAVBAR UI
     ====================================================== */
  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36
      border-b border-gray-500 py-4
      ${isCoursesListPage ? "bg-white" : "bg-cyan-100/70"}`}
    >
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="w-28 lg:w-32 cursor-pointer"
      />

      {/* ===============================
          DESKTOP MENU
      =============================== */}
      <div className="md:flex hidden items-center gap-6 text-gray-600">

{/* ⭐ Explore Dropdown — FINAL 100% FIXED VERSION ⭐ */}
<div
  className="relative cursor-pointer"
  onMouseEnter={() => setShowExplore(true)}
  onMouseLeave={() => setShowExplore(false)}
>
  <p className="flex items-center gap-1 select-none">
    Explore <MdKeyboardArrowDown size={18} />
  </p>

  {showExplore && (
    <div
      className="absolute left-0 top-full bg-white shadow-lg rounded-lg w-56 z-50"
    >
      <div className="p-2">
        {categories.map((cat, index) => (
          <p
            key={index}
            onClick={() => navigate(`/course-list/${cat}`)}
            className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
          >
            {cat}
          </p>
        ))}
      </div>
    </div>
  )}
</div>


        <Link to="/">Home</Link>
        <Link to="/course-list">Courses</Link>

        {/* ⭐ Role Toggle Icon ⭐ */}
        {user && (
          <button
            onClick={handleEducatorToggle}
            className="p-2 rounded-full hover:bg-blue-200 transition cursor-pointer"
            title={isEducator ? "Switch to Student Mode" : "Switch to Educator Mode"}
          >
            <MdSwapHoriz size={26} className="text-blue-600" />
          </button>
        )}

        {/* Links */}
        {user && (
          <>
            {isEducator && (
              <button onClick={() => navigate("/educator")}>
                Educator Dashboard
              </button>
            )}
            | <Link to="/my-enrollments">My Enrollments</Link>
            | <Link to="/profile">Profile</Link>
          </>
        )}

        {/* ⭐ CART ICON ⭐ */}
        <Link to="/cart" className="relative">
          <img src={assets.cart} className="w-6 cursor-pointer" />

          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs 
              w-5 h-5 flex items-center justify-center rounded-full">
              {cart.length}
            </span>
          )}
        </Link>

        {/* Auth */}
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={() => openSignIn()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
          >
            Create Account
          </button>
        )}
      </div>

      {/* ===============================
          MOBILE MENU
      =============================== */}
      <div className="md:hidden flex items-center gap-3 text-gray-600">

        <button
          onClick={handleEducatorToggle}
          className="p-2 rounded-full hover:bg-blue-200 transition"
          title={isEducator ? "Student Mode" : "Educator Mode"}
        >
          <MdSwapHoriz size={26} className="text-blue-600" />
        </button>

        {user && (
          <>
            | <Link to="/my-enrollments">Enrollments</Link>
            | <Link to="/profile">Profile</Link>
          </>
        )}

        <Link to="/cart" className="relative">
          <img src={assets.cart} className="w-6" />

          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs 
              w-4 h-4 flex items-center justify-center rounded-full">
              {cart.length}
            </span>
          )}
        </Link>

        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()}>
            <img src={assets.user_icon} className="w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;

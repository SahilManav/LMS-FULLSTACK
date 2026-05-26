/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { UserButton, useUser } from "@clerk/clerk-react";
import { MdSwapHoriz } from "react-icons/md";
import { AiOutlineHome } from "react-icons/ai"; // ✅ added icon

const Navbar = ({ bgColor }) => {
  const { isEducator, setIsEducator, navigate } = useContext(AppContext);
  const { user } = useUser();

  const handleSwitch = () => {
    setIsEducator(false);
    navigate("/");
  };

  return (
    <div
      className={`flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3 ${bgColor}`}
    >
      {/* LOGO */}
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-28 lg:w-32" />
      </Link>

      <div className="flex items-center gap-6 text-gray-700">

        {/* ✅ HOME BUTTON (REPLACED DASHBOARD) */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 hover:text-blue-600 font-medium"
        >
          <AiOutlineHome size={18} />
          Home
        </button>

        {/* 🔄 SWITCH (ONLY IF EDUCATOR MODE) */}
        {isEducator && (
          <button
            onClick={handleSwitch}
            className="p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
            title="Switch to Student Mode"
          >
            <MdSwapHoriz size={26} className="text-blue-600" />
          </button>
        )}

        {/* 👤 USER INFO */}
        {user && (
          <>
            <p className="hidden sm:block">Hi, {user?.fullName}</p>
            <UserButton />
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
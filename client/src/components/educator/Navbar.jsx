import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { UserButton, useUser } from '@clerk/clerk-react';
import { MdSwapHoriz } from "react-icons/md";

const Navbar = ({ bgColor }) => {
  const { isEducator, setIsEducator, navigate } = useContext(AppContext);
  const { user } = useUser();

  if (!isEducator || !user) return null;

  const handleSwitch = () => {
    // Switch mode → Student Mode
    setIsEducator(false);
    navigate("/");
  };

  return (
    <div className={`flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3 ${bgColor}`}>
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-28 lg:w-32" />
      </Link>

      <div className="flex items-center gap-5 text-gray-700 relative">

        {/* ⭐ Educator -> Student Switch Icon ⭐ */}
        <button
          onClick={handleSwitch}
          className="p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
          title="Switch to Student Mode"
        >
          <MdSwapHoriz size={28} className="text-blue-600" />
        </button>

        <p>Hi! {user.fullName}</p>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;

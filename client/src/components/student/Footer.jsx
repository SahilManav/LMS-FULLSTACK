import React from "react";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <footer className="bg-[#0d0d0d] text-gray-300 mt-10 w-full border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Brand Section */}
        <div>
          <img
            src={assets.logo_dark}
            alt="Edemy Logo"
            className="w-32 mb-4 mx-auto md:mx-0"
          />
          <p className="text-sm leading-relaxed text-center md:text-left text-gray-400">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text.
          </p>
        </div>

        {/* Company Links */}
        <div className="text-center md:text-left">
          <h2 className="font-semibold text-white mb-4 text-lg">Company</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition">Home</a></li>
            <li><a href="#" className="hover:text-white transition">About us</a></li>
            <li><a href="#" className="hover:text-white transition">Contact us</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy policy</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="text-center md:text-left">
          <h2 className="font-semibold text-white mb-4 text-lg">
            Subscribe to our newsletter
          </h2>
          <p className="text-sm text-gray-400 mb-3">
            Get the latest updates and resources, sent to your inbox weekly.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-52 md:w-64 px-3 py-2 rounded bg-gray-800 text-gray-300 border border-gray-700 outline-none text-sm"
            />
            <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} GreatStack. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;

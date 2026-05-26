import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center p-8 rounded-2xl shadow-lg bg-gradient-to-b from-red-50 to-white"
      >
        <div className="text-red-500 text-7xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-500 mb-4 text-lg">
          It looks like you canceled your payment.
        </p>
        <button
          onClick={() => navigate("/course-list")}
          className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Back to Courses
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;

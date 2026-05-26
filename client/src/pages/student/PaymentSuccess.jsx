import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { AppContext } from "../../context/AppContext"; // ✅ Get getToken()

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);

  const courseId = params.get("courseId");
  const purchaseId = params.get("purchaseId");

  const { backendUrl, getToken } = useContext(AppContext);

  const [checking, setChecking] = useState(true);

  // 🔥 CHECK IF USER IS ENROLLED
  const checkEnrollment = async () => {
    try {
      const token = await getToken(); // ⬅️ CLERK TOKEN FIX

      const res = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const enrolled = res.data.enrolledCourses.some(
          (c) => c._id === courseId
        );

        if (enrolled) {
          navigate(`/player/${courseId}`);
          return;
        }
      }

      // Retry after delay
      setTimeout(checkEnrollment, 1500);
    } catch {
      setTimeout(checkEnrollment, 1500);
    }
  };

  useEffect(() => {
    if (courseId) {
      checkEnrollment();
    }
  }, [courseId]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center p-8 rounded-2xl shadow-lg bg-gradient-to-b from-green-50 to-white"
      >
        <motion.div
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.6 }}
          className="text-green-600 text-7xl mb-4"
        >
          ✅
        </motion.div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Payment Successful
        </h1>

        <p className="text-gray-500 text-lg mb-4">
          Verifying your enrollment…
        </p>

        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;

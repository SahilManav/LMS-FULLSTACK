/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { backendUrl, getToken } = useContext(AppContext);

  const params = new URLSearchParams(window.location.search);
  const purchaseId = params.get("purchaseId"); // 🔥 NEW

  const [status, setStatus] = useState("processing");

  const completePurchase = async () => {
    try {
      const token = await getToken();

      // 🔥 COMPLETE PURCHASE (MULTI COURSE ENROLL)
      await axios.post(
        `${backendUrl}/api/user/complete-purchase`,
        { purchaseId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStatus("success");

      setTimeout(() => {
        navigate("/my-enrollments");
      }, 1200);

    } catch (error) {
      console.error("Complete purchase error:", error);

      setStatus("failed");

      setTimeout(() => {
        navigate("/my-enrollments");
      }, 2000);
    }
  };

  useEffect(() => {
    if (purchaseId) {
      completePurchase(); // 🚀 main trigger
    }
  }, [purchaseId]);

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
          className="text-7xl mb-4"
        >
          {status === "success" ? "✅" : status === "failed" ? "❌" : "⏳"}
        </motion.div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {status === "success"
            ? "Enrollment Confirmed"
            : status === "failed"
            ? "Something went wrong"
            : "Processing Payment"}
        </h1>

        <p className="text-gray-500 text-lg mb-4">
          {status === "success"
            ? "Redirecting to your courses..."
            : status === "failed"
            ? "Redirecting to your enrollments..."
            : "Finalizing your purchase..."}
        </p>

        {status !== "success" && status !== "failed" && (
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
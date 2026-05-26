/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import { Routes, Route, useMatch, Navigate } from "react-router-dom";

import Navbar from "./components/student/Navbar";
import Home from "./pages/student/Home";
import CourseDetails from "./pages/student/CourseDetails";
import CoursesList from "./pages/student/CoursesList";

import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Educator from "./pages/educator/Educator";

import Player from "./pages/student/Player";
import MyEnrollments from "./pages/student/MyEnrollments";
import Loading from "./components/student/Loading";
import PaymentSuccess from "./pages/student/PaymentSuccess";
import PaymentCancel from "./pages/student/PaymentCancel";
import CartPage from "./pages/student/CartPage";
import Profile from "./pages/student/Profile";
import VerifyCertificate from "./pages/student/VerifyCertificate";

import Leaderboard from "./pages/Leaderboard";

// ✅ CLASSROOM
import Classroom from "./pages/student/Classroom";
import ClassroomDetail from "./pages/student/ClassroomDetail";
import CreateClassroom from "./pages/educator/CreateClassroom";
import Attendance from "./pages/educator/Attendance";

import "quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

// ✅ CONTEXT
import { AppContext } from "./context/AppContext";

const App = () => {
  const isEducatorRoute = useMatch("/educator/*");

  // ✅ Added userData
  const { isEducator, userData } =
    useContext(AppContext);

  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer />

      {!isEducatorRoute && <Navbar />}

      <Routes>

        {/* ================= STUDENT ================= */}

        <Route path="/" element={<Home />} />
        <Route
          path="/course/:id"
          element={<CourseDetails />}
        />

        <Route
          path="/course-list"
          element={<CoursesList />}
        />

        <Route
          path="/course-list/:input"
          element={<CoursesList />}
        />

        <Route
          path="/my-enrollments"
          element={<MyEnrollments />}
        />

        <Route
          path="/player/:courseId"
          element={<Player />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/verify/:certificateId"
          element={<VerifyCertificate />}
        />

        <Route
          path="/cart"
          element={<CartPage />}
        />

        <Route
          path="/payment-success"
          element={<PaymentSuccess />}
        />

        <Route
          path="/payment-cancel"
          element={<PaymentCancel />}
        />

        <Route
          path="/loading/:path"
          element={<Loading />}
        />

        {/* 🎓 STUDENT CLASSROOM */}

        <Route
          path="/classroom"
          element={<Classroom />}
        />

        <Route
          path="/classroom/:id"
          element={<ClassroomDetail />}
        />

        {/* ================= EDUCATOR ================= */}

        <Route
          path="/educator"
          element={
            userData === null ? (
              <Loading />
            ) : isEducator ? (
              <Educator />
            ) : (
              <Navigate to="/" />
            )
          }
        >
          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="add-course"
            element={<AddCourse />}
          />

          <Route
            path="my-courses"
            element={<MyCourses />}
          />

          <Route
            path="student-enrolled"
            element={<StudentsEnrolled />}
          />

          <Route
            path="classroom"
            element={<CreateClassroom />}
          />

          <Route
            path="classroom/:id"
            element={<ClassroomDetail />}
          />

          <Route
            path="attendance"
            element={<Attendance />}
          />

          <Route
            path="leaderboard"
            element={<Leaderboard />}
          />
        </Route>

      </Routes>
    </div>
  );
};

export default App;
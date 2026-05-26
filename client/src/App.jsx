import React from "react";
import { Routes, Route, useMatch } from "react-router-dom";

import Navbar from "./components/student/Navbar";
import Home from "./pages/student/Home";
import CourseDetails from "./pages/student/CourseDetails";
import CoursesList from "./pages/student/CoursesList";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Educator from "./pages/educator/Educator";

import "quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import Player from "./pages/student/Player";
import MyEnrollments from "./pages/student/MyEnrollments";
import Loading from "./components/student/Loading";
import PaymentSuccess from "./pages/student/PaymentSuccess";
import PaymentCancel from "./pages/student/PaymentCancel";
import CartPage from "./pages/student/CartPage";
import Profile from "./pages/student/Profile";

const App = () => {
  const isEducatorRoute = useMatch("/educator/*");

  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer />

      {/* Navbar only visible on student side */}
      {!isEducatorRoute && <Navbar />}

      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />

        {/* ⭐ My Enrollments */}
        <Route path="/my-enrollments" element={<MyEnrollments />} />

        {/* ⭐ Player Route (Correct) */}
        <Route path="/player/:courseId" element={<Player />} />

        {/* Other pages */}
        <Route path="/loading/:path" element={<Loading />} />
        <Route path="/profile" element={<Profile />} />

        {/* ⭐ Cart Page */}
        <Route path="/cart" element={<CartPage />} />

        {/* Payment */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />

        {/* Educator Dashboard & Pages */}
        <Route path="/educator" element={<Educator />}>
          <Route index element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="student-enrolled" element={<StudentsEnrolled />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;

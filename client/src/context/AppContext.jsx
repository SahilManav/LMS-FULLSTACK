import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  /* ========================================
     GLOBAL STATES
  ======================================== */
  const [showLogin, setShowLogin] = useState(false);
  const [isEducator, setIsEducator] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);

  /* ========================================
     CART
  ======================================== */
  const [cart, setCart] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("lms_cart") || "[]");
      setCart(saved);
    } catch {
      setCart([]);
    }
  }, []);

  const saveCart = (items) => {
    setCart(items);
    localStorage.setItem("lms_cart", JSON.stringify(items));
  };

  const addToCart = (courseObj) => {
    const exists = cart.some((c) => c._id === courseObj._id);
    if (exists) return toast.info("Already in cart");

    saveCart([...cart, courseObj]);
    toast.success("Added to cart");
  };

  const removeFromCart = (courseId) => {
    saveCart(cart.filter((item) => item._id !== courseId));
    toast.info("Removed from cart");
  };

  const cartCount = cart.length;

  /* ========================================
     FETCH ALL COURSES  (FIXED + IMAGE MAPPING)
  ======================================== */
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/all`);

      if (data.success) {
        // ⭐ Normalize course images
        const normalized = data.courses.map((c) => ({
          ...c,
          courseThumbnail:
            c.courseThumbnail ||
            c.thumbnail ||
            c.effectiveThumbnail ||
            "",
        }));

        setAllCourses(normalized);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to load courses");
      console.log(error);
    }
  };

  /* ========================================
     FETCH USER DATA
  ======================================== */
  const fetchUserData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.user);
        setIsEducator(data.user.role === "educator");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* Detect Educator Role from Clerk */
  useEffect(() => {
    if (user?.publicMetadata?.role === "educator") {
      setIsEducator(true);
    }
  }, [user]);

  /* ========================================
     FETCH ENROLLED COURSES
  ======================================== */
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/user/enrolled-courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setEnrolledCourses([...data.enrolledCourses].reverse());
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ========================================
     COURSE HELPER FUNCTIONS
  ======================================== */
  const calculateChapterTime = (chapter) => {
    if (!Array.isArray(chapter?.chapterContent)) return "—";
    let sum = 0;
    chapter.chapterContent.forEach((lec) => {
      sum += Number(lec?.lectureDuration || 0);
    });
    return humanizeDuration(sum * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateCourseDuration = (course) => {
    if (!Array.isArray(course?.courseContent)) return "—";
    let total = 0;
    course.courseContent.forEach((ch) =>
      ch.chapterContent?.forEach(
        (lec) => (total += Number(lec?.lectureDuration || 0))
      )
    );
    return humanizeDuration(total * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateRating = (course) => {
    if (!Array.isArray(course?.courseRatings)) return 0;
    const total = course.courseRatings.reduce(
      (sum, r) => sum + (r?.rating || 0),
      0
    );
    return Math.floor(total / course.courseRatings.length) || 0;
  };

  const calculateNoOfLectures = (course) => {
    if (!Array.isArray(course?.courseContent)) return 0;
    return course.courseContent.reduce(
      (sum, chap) => sum + (chap?.chapterContent?.length || 0),
      0
    );
  };

  /* ========================================
     INITIAL LOAD
  ======================================== */
  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    }
  }, [user]);

  /* ========================================
     CONTEXT VALUE
  ======================================== */
  const value = {
    backendUrl,
    currency,
    navigate,

    showLogin,
    setShowLogin,

    userData,
    setUserData,

    isEducator,
    setIsEducator,

    getToken,

    allCourses,
    fetchAllCourses,

    calculateChapterTime,
    calculateCourseDuration,
    calculateRating,
    calculateNoOfLectures,

    enrolledCourses,
    fetchUserEnrolledCourses,

    cart,
    addToCart,
    removeFromCart,
    cartCount,

    recentCourses,
    setRecentCourses,

    fetchUserData,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

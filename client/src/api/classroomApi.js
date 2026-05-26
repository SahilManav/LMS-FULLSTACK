import axios from "axios";

const API = "http://localhost:5000/api/classroom";

/* ======================================================
🔥 AXIOS INSTANCE
====================================================== */
const api = axios.create({
  baseURL: API,
});

/* ======================================================
🔥 REQUEST INTERCEPTOR
====================================================== */
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ======================================================
🔥 RESPONSE INTERCEPTOR (UPDATED)
====================================================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔥 API ERROR:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.warn("❌ Unauthorized - Token missing or expired");
    }

    return Promise.reject(error);
  }
);

/* ======================================================
📚 CLASSROOM APIs
====================================================== */

export const createClassroom = async (data) => {
  const res = await api.post("/create", data);
  return res.data;
};

export const joinClassroom = async (data) => {
  const res = await api.post("/join", data);
  return res.data;
};

export const getMyClassrooms = async () => {
  const res = await api.get("/my");
  return res.data;
};

export const getCreatedClassrooms = async () => {
  const res = await api.get("/created");
  return res.data;
};

export const getClassroomById = async (id) => {
  const res = await api.get(`/${id}`);
  return res.data;
};

/* ======================================================
🎥 LIVE CLASS (🔥 FIXED)
====================================================== */
export const addLiveClass = async (id, data) => {
  // ✅ ensure proper date format
  if (!data.date) throw new Error("Date is required");

  const payload = {
    ...data,
    date: new Date(data.date).toISOString(), // ✅ FIX
  };

  const res = await api.post(`/${id}/live`, payload);
  return res.data;
};

/* ======================================================
📝 ASSIGNMENT
====================================================== */
export const addAssignment = async (id, data) => {
  const res = await api.post(`/${id}/assignment`, data);
  return res.data;
};

/* ======================================================
🧠 QUIZ
====================================================== */
export const createQuiz = async (id, data) => {
  const res = await api.post(`/${id}/quiz`, data);
  return res.data;
};

export const submitQuiz = async (id, data) => {
  const res = await api.post(`/${id}/submit-quiz`, data);
  return res.data;
};

export const getLeaderboard = async (id, quizIndex) => {
  const res = await api.get(`/${id}/leaderboard?quizIndex=${quizIndex}`);
  return res.data;
};

/* ======================================================
📊 ATTENDANCE
====================================================== */
export const markAttendance = async (id, data) => {
  const res = await api.post(`/${id}/attendance`, data);
  return res.data;
};

export default api;
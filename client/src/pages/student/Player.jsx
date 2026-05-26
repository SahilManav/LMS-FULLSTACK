/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import YouTube from "react-youtube";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";
import { useUser } from "@clerk/clerk-react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

const Player = () => {
const {
  backendUrl,
  getToken,
  calculateChapterTime,
  navigate,
  fetchUserEnrolledCourses,
} = useContext(AppContext);

  const { courseId } = useParams();
  const { user } = useUser();

  const [courseData, setCourseData] = useState(null);
  const [playerData, setPlayerData] = useState(null);

  const [progressData, setProgressData] = useState({
    lectureCompleted: [],
  });

  const [loading, setLoading] = useState(true);

  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [discussions, setDiscussions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loadingDiscussion, setLoadingDiscussion] =
    useState(false);

  /* ================= FETCH COURSE ================= */
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = await getToken();

        const { data } = await axios.get(
          `${backendUrl}/api/course/player/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success) {
          setCourseData(data.courseData);
        }
      } catch {
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourse();
  }, [courseId]);

  /* ================= LOAD PROGRESS FROM DB ================= */
  useEffect(() => {
    const loadProgress = async () => {
      try {
        if (!user) return;

        const token = await getToken();

        const { data } = await axios.get(
          `${backendUrl}/api/progress/${user.id}/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProgressData({
          lectureCompleted:
            data?.lectureCompleted?.map(
              (item) => item.lectureId
            ) || [],
        });
      } catch (err) {
        console.log(err);
      }
    };

    loadProgress();
  }, [courseId, user]);

  /* ================= SAVE PROGRESS TO DB ================= */
const markLectureComplete = async (lectureId) => {
  try {
    if (!user) return;

    const token = await getToken();

    await axios.post(
      `${backendUrl}/api/progress/complete`,
      {
        userId: user.id,
        courseId,
        lectureId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setProgressData((prev) => ({
      lectureCompleted:
        prev.lectureCompleted.includes(lectureId)
          ? prev.lectureCompleted
          : [...prev.lectureCompleted, lectureId],
    }));

    // 🔥 refresh homepage Continue Learning section
    await fetchUserEnrolledCourses();

  } catch (error) {
    console.log(error);
    toast.error("Failed to save progress");
  }
};

  /* ================= SAVE NOTES ================= */

  const handleSaveNote = async () => {
    if (!user || !playerData?.lectureId)
      return;

    try {
      setSavingNote(true);

      const token = await getToken();

      await axios.post(
        `${backendUrl}/api/notes/save`,
        {
          userId: user.id,
          courseId,
          lectureId:
            playerData.lectureId,
          noteContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Note saved");

    } catch {
      toast.error(
        "Failed to save note"
      );
    } finally {
      setSavingNote(false);
    }
  };

  /* ================= CERTIFICATE ================= */

  const downloadCertificate =
    async () => {
      const doc =
        new jsPDF("landscape");

      const studentName =
        user?.fullName ||
        "Student";

      const teacherName =
        courseData?.educator?.name ||
        "Instructor";

      const courseName =
        courseData?.courseTitle ||
        "Course";

      const date =
        new Date().toLocaleDateString(
          "en-IN"
        );

      const certificateId =
        courseId;

      const qrUrl = `http://localhost:5173/verify/${certificateId}`;

      const qrImage =
        await QRCode.toDataURL(
          qrUrl
        );

      doc.setFontSize(30);

      doc.text(
        "Certificate of Completion",
        148,
        40,
        null,
        null,
        "center"
      );

      doc.text(
        studentName,
        148,
        80,
        null,
        null,
        "center"
      );

      doc.text(
        courseName,
        148,
        120,
        null,
        null,
        "center"
      );

      doc.addImage(
        qrImage,
        "PNG",
        230,
        120,
        40,
        40
      );

      doc.save(
        "certificate.pdf"
      );
    };

  const extractYouTubeId = (
    url
  ) => {
    try {
      const parsed =
        new URL(url);

      if (
        parsed.hostname ===
        "youtu.be"
      )
        return parsed.pathname.substring(
          1
        );

      if (
        parsed.hostname.includes(
          "youtube.com"
        )
      )
        return parsed.searchParams.get(
          "v"
        );

      return null;
    } catch {
      return null;
    }
  };

  const totalLectures =
    courseData?.courseContent?.reduce(
      (acc, chapter) =>
        acc +
        chapter.chapterContent.length,
      0
    ) || 0;

  const completedLectures =
    progressData
      .lectureCompleted.length;

  const isCourseCompleted =
    totalLectures > 0 &&
    completedLectures >=
      totalLectures;

  if (loading)
    return <Loading />;

  return (
    <>
      <div className="p-4 sm:p-10 md:px-36 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-xl font-semibold">
            Course Structure
          </h2>

          {courseData?.courseContent.map(
            (chapter) => (
              <div
                key={
                  chapter.chapterId
                }
                className="border bg-white rounded mt-4"
              >
                <div className="px-4 py-3 flex justify-between">
                  <p className="font-semibold">
                    {
                      chapter.chapterTitle
                    }
                  </p>

                  <p className="text-sm text-gray-600">
                    {
                      chapter
                        .chapterContent
                        .length
                    }{" "}
                    lectures •{" "}
                    {calculateChapterTime(
                      chapter
                    )}
                  </p>
                </div>

                <ul className="px-6 pb-3">
                  {chapter.chapterContent.map(
                    (
                      lec
                    ) => (
                      <li
                        key={
                          lec.lectureId
                        }
                        className="flex justify-between py-1 text-sm"
                      >
                        <span>
                          {
                            lec.lectureTitle
                          }
                        </span>

                        <span
                          className="text-blue-600 cursor-pointer"
                          onClick={() =>
                            setPlayerData(
                              {
                                ...lec,
                                videoId:
                                  extractYouTubeId(
                                    lec.lectureUrl
                                  ),
                              }
                            )
                          }
                        >
                          Watch
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )
          )}
        </div>

        <div>
          {playerData ? (
            <>
              <YouTube
                videoId={
                  playerData.videoId
                }
                iframeClassName="w-full aspect-video"
                opts={{
                  playerVars: {
                    autoplay: 1,
                  },
                }}
                onEnd={() =>
                  markLectureComplete(
                    playerData.lectureId
                  )
                }
              />

              <p className="mt-2 font-medium">
                {
                  playerData.lectureTitle
                }
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Progress:{" "}
                {
                  completedLectures
                }
                /
                {
                  totalLectures
                }
              </p>

              {isCourseCompleted && (
                <button
                  onClick={() => {
                    downloadCertificate();
                    navigate(
                      `/verify/${courseId}`
                    );
                  }}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded"
                >
                  🎓 Get Certificate
                </button>
              )}
            </>
          ) : (
            <p>
              Select a lecture
              to start
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Player;
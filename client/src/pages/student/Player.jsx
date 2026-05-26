import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import YouTube from "react-youtube";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";

const Player = () => {
  const { backendUrl, getToken, calculateChapterTime } = useContext(AppContext);
  const { courseId } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCourseForPlayer = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/course/player/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setCourseData(data.courseData);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to load player");
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeId = (url) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === "youtu.be") return parsed.pathname.substring(1);
      if (parsed.hostname.includes("youtube.com"))
        return parsed.searchParams.get("v");
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchCourseForPlayer();
  }, [courseId]);

  if (loading) return <Loading />;

  if (!courseData) {
    return (
      <div className="h-[70vh] flex justify-center items-center text-gray-600 text-lg">
        Course not found or access denied.
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-10 md:px-36 grid md:grid-cols-2 gap-10">
        {/* LEFT SIDE */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Course Structure</h2>

          {courseData.courseContent.map((chapter, cIndex) => (
            <div key={cIndex} className="border bg-white rounded mt-4">
              <div className="px-4 py-3 flex justify-between">
                <p className="font-semibold">{chapter.chapterTitle}</p>
                <p className="text-sm text-gray-600">
                  {chapter.chapterContent.length} lectures •{" "}
                  {calculateChapterTime(chapter)}
                </p>
              </div>

              <ul className="px-6 pb-3">
                {chapter.chapterContent.map((lec, lIndex) => (
                  <li key={lIndex} className="flex justify-between py-1 text-sm">
                    <span>{lec.lectureTitle}</span>

                    <span
                      className="text-blue-600 cursor-pointer"
                      onClick={() =>
                        setPlayerData({
                          ...lec,
                          videoId: extractYouTubeId(lec.lectureUrl),
                          chapter: cIndex + 1,
                          lecture: lIndex + 1,
                        })
                      }
                    >
                      Watch
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE PLAYER */}
        <div>
          {playerData ? (
            <>
              <YouTube
                videoId={playerData.videoId}
                iframeClassName="w-full aspect-video"
              />
              <p className="mt-2 text-gray-800 font-medium">
                {playerData.chapter}.{playerData.lecture} — {playerData.lectureTitle}
              </p>
            </>
          ) : (
            <img
              src={
                courseData.thumbnail ??
                "https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              }
              className="w-72 h-72 object-cover mx-auto rounded shadow"
            />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Player;

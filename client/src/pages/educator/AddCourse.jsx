import { useContext, useEffect, useRef, useState } from "react";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import Quill from "quill";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const AddCourse = () => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const { backendUrl, getToken } = useContext(AppContext);

  // ---------------- STATES ----------------
  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);

  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [language, setLanguage] = useState("English");
  const [duration, setDuration] = useState("");
  const [requirements, setRequirements] = useState("");
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
  });

  // ---------------- CHAPTER HANDLERS ----------------
  const handleChapter = (action, chapterId) => {
    if (action === "add") {
      const title = prompt("Enter Chapter Name:");
      if (!title?.trim()) return;

      setChapters((prev) => [
        ...prev,
        {
          chapterId: crypto.randomUUID(),
          chapterTitle: title.trim(),
          chapterContent: [],
          collapsed: false,
        },
      ]);
    }

    if (action === "remove") {
      setChapters((prev) => prev.filter((c) => c.chapterId !== chapterId));
    }

    if (action === "toggle") {
      setChapters((prev) =>
        prev.map((c) =>
          c.chapterId === chapterId
            ? { ...c, collapsed: !c.collapsed }
            : c
        )
      );
    }
  };

  // ---------------- LECTURE HANDLERS ----------------
  const handleLecture = (action, chapterId, index) => {
    if (action === "add") {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    }

    if (action === "remove") {
      setChapters((prev) =>
        prev.map((c) =>
          c.chapterId === chapterId
            ? {
                ...c,
                chapterContent: c.chapterContent.filter((_, i) => i !== index),
              }
            : c
        )
      );
    }
  };

  const addLecture = () => {
    if (!lectureDetails.lectureTitle || !lectureDetails.lectureUrl) {
      toast.error("Fill all lecture details");
      return;
    }

    setChapters((prev) =>
      prev.map((c) =>
        c.chapterId === currentChapterId
          ? {
              ...c,
              chapterContent: [
                ...c.chapterContent,
                { ...lectureDetails, lectureId: crypto.randomUUID() },
              ],
            }
          : c
      )
    );

    setLectureDetails({
      lectureTitle: "",
      lectureDuration: "",
      lectureUrl: "",
      isPreviewFree: false,
    });
    setShowPopup(false);
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error("Please upload thumbnail");

    try {
      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        category,
        level,
        language,
        duration,
        requirements: requirements.split(",").map((r) => r.trim()),
        whatYouWillLearn: whatYouWillLearn.split(",").map((r) => r.trim()),
        courseContent: chapters,
      };

      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData));
      formData.append("image", image);

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/educator/course/add-course`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Course added successfully");
        resetForm();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const resetForm = () => {
    setCourseTitle("");
    setCoursePrice(0);
    setDiscount(0);
    setImage(null);
    setChapters([]);
    setCategory("");
    setLevel("Beginner");
    setLanguage("English");
    setDuration("");
    setRequirements("");
    setWhatYouWillLearn("");
    if (quillRef.current) quillRef.current.root.innerHTML = "";
  };

  // ---------------- QUILL INIT ----------------
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: "snow" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Add New Course</h1>
        <p className="text-gray-500 mb-8">
          Create and publish a new course
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Course Basics">
              <Input label="Course Title" value={courseTitle} onChange={setCourseTitle} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input label="Category" value={category} onChange={setCategory} />
                <Select label="Level" value={level} onChange={setLevel} options={["Beginner", "Intermediate", "Advanced"]} />
                <Input label="Language" value={language} onChange={setLanguage} />
                <Input label="Duration" value={duration} onChange={setDuration} />
              </div>
            </Card>

            <Card title="Course Description">
              <div ref={editorRef} className="min-h-[200px]" />
            </Card>

            <Card title="Learning Outcomes">
              <Textarea label="Requirements" value={requirements} onChange={setRequirements} />
              <Textarea label="What You’ll Learn" value={whatYouWillLearn} onChange={setWhatYouWillLearn} />
            </Card>

            <Card title="Curriculum">
              <ChapterList
                chapters={chapters}
                handleChapter={handleChapter}
                handleLecture={handleLecture}
              />
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <Card title="Pricing">
              <div className="flex gap-4">
                <Input label="Price ($)" type="number" value={coursePrice} onChange={setCoursePrice} />
                <Input label="Discount %" type="number" value={discount} onChange={setDiscount} />
              </div>
            </Card>

            <Card title="Thumbnail">
              <ThumbnailUpload image={image} setImage={setImage} />
            </Card>

            <div className="bg-white p-6 rounded-xl shadow-sm flex gap-3">
              <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700">
                Publish
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 border rounded-lg hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {showPopup && (
          <LecturePopup
            lectureDetails={lectureDetails}
            setLectureDetails={setLectureDetails}
            onCancel={() => setShowPopup(false)}
            onAdd={addLecture}
          />
        )}
      </form>
    </div>
  );
};

/* ---------------- UI COMPONENTS ---------------- */

const Card = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = "text" }) => (
  <div>
    <p className="text-sm mb-1">{label}</p>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div className="mt-3">
    <p className="text-sm mb-1">{label}</p>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2"
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <p className="text-sm mb-1">{label}</p>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

const ThumbnailUpload = ({ image, setImage }) => (
  <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50">
    <img src={assets.file_upload_icon} className="w-10 mb-2" alt="upload" />
    <p className="text-sm text-gray-500">Upload Thumbnail</p>
    <input type="file" hidden accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
    {image && <img src={URL.createObjectURL(image)} className="mt-3 h-16 rounded" alt="preview" />}
  </label>
);

const ChapterList = ({ chapters, handleChapter, handleLecture }) => (
  <div>
    {chapters.map((ch, i) => (
      <div key={ch.chapterId} className="border rounded-lg mb-4">
        <div className="flex justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <img
              src={assets.dropdown_icon}
              width={14}
              className={`cursor-pointer ${ch.collapsed && "-rotate-90"}`}
              onClick={() => handleChapter("toggle", ch.chapterId)}
              alt=""
            />
            <span className="font-medium">
              {i + 1}. {ch.chapterTitle}
            </span>
          </div>
          <img
            src={assets.cross_icon}
            className="cursor-pointer"
            onClick={() => handleChapter("remove", ch.chapterId)}
            alt=""
          />
        </div>

        {!ch.collapsed && (
          <div className="p-4 space-y-2">
            {ch.chapterContent.map((lec, j) => (
              <div key={lec.lectureId} className="flex justify-between text-sm">
                <span>
                  {j + 1}. {lec.lectureTitle}
                </span>
                <img
                  src={assets.cross_icon}
                  className="cursor-pointer"
                  onClick={() => handleLecture("remove", ch.chapterId, j)}
                  alt=""
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleLecture("add", ch.chapterId)}
              className="text-blue-600 text-sm mt-2"
            >
              + Add Lecture
            </button>
          </div>
        )}
      </div>
    ))}

    <button
      type="button"
      onClick={() => handleChapter("add")}
      className="w-full bg-blue-100 text-blue-600 py-2 rounded-lg"
    >
      + Add Chapter
    </button>
  </div>
);

const LecturePopup = ({ lectureDetails, setLectureDetails, onCancel, onAdd }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-96">
      <h2 className="text-lg font-semibold mb-4">Add Lecture</h2>

      <Input
        label="Lecture Title"
        value={lectureDetails.lectureTitle}
        onChange={(v) => setLectureDetails({ ...lectureDetails, lectureTitle: v })}
      />
      <Input
        label="Duration (mins)"
        type="number"
        value={lectureDetails.lectureDuration}
        onChange={(v) => setLectureDetails({ ...lectureDetails, lectureDuration: v })}
      />
      <Input
        label="Lecture URL"
        value={lectureDetails.lectureUrl}
        onChange={(v) => setLectureDetails({ ...lectureDetails, lectureUrl: v })}
      />

      <div className="flex gap-2 mt-3">
        <input
          type="checkbox"
          checked={lectureDetails.isPreviewFree}
          onChange={(e) =>
            setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })
          }
        />
        <span>Free Preview</span>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
          Cancel
        </button>
        <button onClick={onAdd} className="px-4 py-2 bg-blue-600 text-white rounded">
          Add
        </button>
      </div>
    </div>
  </div>
);

export default AddCourse;

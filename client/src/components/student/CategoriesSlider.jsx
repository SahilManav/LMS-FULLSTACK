import React, { useRef } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// small icon set by category (fallback simple circle)
const icons = {
  "Web Development": "🌐",
  "Data Science": "📊",
  "AI & Machine Learning": "🤖",
  "Cyber Security": "🔒",
  JavaScript: "🟨",
  Python: "🐍",
  "UI/UX": "🎨",
  Business: "💼",
  Design: "✏️",
};

const CategoriesSlider = ({ categories = [] }) => {
  const scroller = useRef();
  const navigate = useNavigate();

  const scroll = (dir = "right") => {
    if (!scroller.current) return;
    const w = scroller.current.clientWidth;
    scroller.current.scrollBy({
      left: dir === "right" ? w * 0.6 : -w * 0.6,
      behavior: "smooth",
    });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mt-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Browse categories</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll("left")} className="p-2 rounded-full hover:bg-gray-100">
            <MdKeyboardArrowLeft />
          </button>
          <button onClick={() => scroll("right")} className="p-2 rounded-full hover:bg-gray-100">
            <MdKeyboardArrowRight />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1"
        style={{ scrollBehavior: "smooth" }}
      >
        {categories.map((cat, i) => (
          <div
            key={cat}
            onClick={() => navigate(`/course-list/${encodeURIComponent(cat)}`)}
            className="min-w-[170px] flex-shrink-0 bg-white border rounded-lg p-4 cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <div className="text-2xl mb-2">{icons[cat] || "📚"}</div>
            <div className="font-semibold">{cat}</div>
            <div className="text-sm text-gray-500 mt-1">Explore {cat}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSlider;

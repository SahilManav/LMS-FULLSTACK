import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { FaFire } from "react-icons/fa";

const TrendingSection = () => {
  const { allCourses } = useContext(AppContext);

  // derive simple trending data (top categories by enrollment)
  const [topCategories, setTopCategories] = useState([]);

  useEffect(() => {
    if (!allCourses || allCourses.length === 0) return;

    // example: count per category (assumes course.category exists)
    const counts = {};
    allCourses.forEach((c) => {
      const cat = c.category || "Other";
      counts[cat] = (counts[cat] || 0) + (c.studentsCount || 1);
    });

    const sorted = Object.entries(counts)
      .map(([k, v]) => ({ category: k, value: v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    setTopCategories(sorted);
  }, [allCourses]);

  // small animated number helper
  const AnimatedNumber = ({ value }) => {
    const [num, setNum] = useState(0);
    useEffect(() => {
      let start = 0;
      const dur = 900;
      const step = Math.ceil(value / (dur / 30));
      const iv = setInterval(() => {
        start += step;
        if (start >= value) {
          setNum(value);
          clearInterval(iv);
        } else setNum(start);
      }, 30);
      return () => clearInterval(iv);
    }, [value]);
    return <span className="font-semibold">{num.toLocaleString()}</span>;
  };

  if (!topCategories.length) return null;

  return (
    <section className="w-full max-w-6xl mt-8 px-4">
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-3">
            <FaFire className="text-red-500" /> Trending now
          </h3>
          <p className="text-sm text-gray-500">Live updates from our learners</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {topCategories.map((t, idx) => (
            <div
              key={t.category}
              className="bg-white rounded-lg p-4 flex flex-col items-start gap-2 shadow-sm hover:shadow-md transition"
            >
              <div className="text-sm text-gray-500">{idx + 1}. {t.category}</div>
              <div className="text-blue-600 text-lg">
                <AnimatedNumber value={t.value} />+ learners
              </div>
              <div className="text-xs text-gray-400">Trending</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;

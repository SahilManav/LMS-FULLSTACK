import React, { useState, useEffect } from "react";

const Rating = ({ initialRating = 0, onRate }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleRating = (value) => {
    setRating(value);
    if (onRate) onRate(value);
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-2xl cursor-pointer transition-colors duration-200 ${
            star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
          }`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          onClick={() => handleRating(star)}
        >
          &#9733;
        </span>
      ))}
    </div>
  );
};

export default Rating;

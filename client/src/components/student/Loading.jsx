import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[70vh]">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 font-medium text-lg">Loading...</p>
    </div>
  );
};

export default Loading;

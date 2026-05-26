import React from 'react';
import { assets } from '../../assets/assets'; // ✅ Fix: import assets
import { dummyTestimonial } from '../../assets/coursesData'; // ✅ Now dummy data comes from coursesData.js

const TestimonialsSection = () => {
  return (
    <section className="md:px-36 px-8 py-16 bg-gray-50 text-left">
      <h2 className="text-3xl font-semibold text-gray-800 mb-10">What Our Learners Say</h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {dummyTestimonial.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={item.image || assets.profile_img_1}
                alt={item.name}
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-gray-500 text-sm">{item.role}</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.feedback}</p>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={i < Math.floor(item.rating) ? assets.star : assets.star_blank}
                  className="w-4 h-4"
                  alt="rating"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;

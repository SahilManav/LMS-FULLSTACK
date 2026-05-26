import React from 'react';
import Footer from '../../components/student/Footer';
import Hero from '../../components/student/Hero';
import Companies from '../../components/student/Companies';
import CoursesSection from '../../components/student/CoursesSection';
import TestimonialsSection from '../../components/student/TestimonialsSection';
import CallToAction from '../../components/student/CallToAction';
import ContinueCarousel from '../../components/student/ContinueCarousel';
import TrendingSection from '../../components/student/TrendingSection';
import CategoriesSlider from '../../components/student/CategoriesSlider';
import FeaturedCourses from '../../components/student/FeaturedCourses';

const Home = () => {
  const categories = [
    "Web Development",
    "Data Science",
    "AI & Machine Learning",
    "Cyber Security",
    "JavaScript",
    "Python",
    "UI/UX",
    "Business",
    "Design",
  ];

  return (
    <div className="flex flex-col items-center space-y-10 text-center">
      <Hero />

      {/* PERSONALIZED / PREMIUM SECTIONS */}
      <ContinueCarousel />

      {/* Trending */}
      <TrendingSection />

      {/* Categories horizontal slider */}
      <CategoriesSlider categories={categories} />

      {/* Featured courses grid */}
      <FeaturedCourses />

      {/* existing sections */}
      <Companies />
      <CoursesSection />
      <TestimonialsSection />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Home;

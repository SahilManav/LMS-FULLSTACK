// src/assets/coursesData.js

import { assets } from './assets';

// ✅ Testimonials (Homepage)
export const dummyTestimonial = [
  {
    name: 'Donald Jackman',
    role: 'SWE 1 @ Amazon',
    image: assets.profile_img_1,
    rating: 5,
    feedback:
      "I've been using Imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.",
  },
  {
    name: 'Richard Nelson',
    role: 'SWE 2 @ Samsung',
    image: assets.profile_img_2,
    rating: 4,
    feedback:
      "I've been using Imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.",
  },
  {
    name: 'James Washington',
    role: 'SWE 2 @ Google',
    image: assets.profile_img_3,
    rating: 4.5,
    feedback:
      "I've been using Imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.",
  },
];

// ✅ Dummy Courses (for development/demo)
export const dummyCourses = [
  {
    courseTitle: 'Introduction to JavaScript',
    courseDescription: `
      <h2>Learn the Basics of JavaScript</h2>
      <p>JavaScript is a versatile programming language that powers the web. In this course, you will learn the fundamentals of JavaScript, including syntax, data types, and control structures.</p>
      <ul>
        <li>Understand the basics of programming</li>
        <li>Learn how to manipulate the DOM</li>
        <li>Create dynamic web applications</li>
      </ul>
    `,
    courseThumbnail: assets.course_1_thumbnail,
    coursePrice: 49.99,
    isPublished: true,
    discount: 20,
    courseContent: [
      {
        chapterId: 'chapter1',
        chapterOrder: 1,
        chapterTitle: 'Getting Started with JavaScript',
        chapterContent: [
          {
            lectureId: 'lecture1',
            lectureTitle: 'What is JavaScript?',
            lectureDuration: 600,
            lectureUrl: 'https://www.youtube.com/watch?v=upDLs1sn7g4',
            isPreviewFree: true,
          },
          {
            lectureId: 'lecture2',
            lectureTitle: 'Setting Up Your Environment',
            lectureDuration: 900,
            lectureUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
            isPreviewFree: false,
          },
        ],
      },
      {
        chapterId: 'chapter2',
        chapterOrder: 2,
        chapterTitle: 'Variables and Data Types',
        chapterContent: [
          {
            lectureId: 'lecture3',
            lectureTitle: 'Understanding Variables',
            lectureDuration: 750,
            lectureUrl: 'https://www.youtube.com/watch?v=Ukg_U3CnJWI',
            isPreviewFree: true,
          },
          {
            lectureId: 'lecture4',
            lectureTitle: 'Data Types in JavaScript',
            lectureDuration: 800,
            lectureUrl: 'https://www.youtube.com/watch?v=DG4obitDvUA',
            isPreviewFree: false,
          },
        ],
      },
    ],
  },
  {
    courseTitle: 'Advanced Python Programming',
    courseDescription: `
      <h2>Deep Dive into Python Programming</h2>
      <p>This course is designed for those who have a basic understanding of Python and want to take their skills to the next level. You will explore advanced topics such as decorators, generators, and context managers.</p>
      <ul>
        <li>Master advanced data structures</li>
        <li>Implement OOP concepts</li>
        <li>Work with libraries and frameworks</li>
      </ul>
    `,
    courseThumbnail: assets.course_2_thumbnail,
    coursePrice: 79.99,
    isPublished: true,
    discount: 15,
    courseContent: [
      {
        chapterId: 'chapter1',
        chapterOrder: 1,
        chapterTitle: 'Advanced Data Structures',
        chapterContent: [
          {
            lectureId: 'lecture1',
            lectureTitle: 'Lists and Tuples',
            lectureDuration: 720,
            lectureUrl: 'https://www.youtube.com/watch?v=HGOBQPFzWKo',
            isPreviewFree: true,
          },
        ],
      },
    ],
  },
];

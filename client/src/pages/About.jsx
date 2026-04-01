
import React from "react";
import { motion } from "framer-motion";
import { Award, BookOpen, Users, Target, Eye, Heart } from 'lucide-react';

import FoundingStory from "../assets/Images/FoundingStory.png";
import BannerImage1 from "../assets/Images/aboutus1.webp";
import BannerImage2 from "../assets/Images/aboutus2.webp";
import BannerImage3 from "../assets/Images/aboutus3.webp";
import Footer from "../components/Common/Footer";
import ReviewSlider from "../components/Common/ReviewSlider"
import ContactFormSection from "../components/core/AboutPage/ContactFormSection";
import LearningGrid from "../components/core/AboutPage/LearningGrid";
import Quote from "../components/core/AboutPage/Quote";
import StatsComponenet from "../components/core/AboutPage/Stats";
import HighlightText from "../components/core/HomePage/HighlightText";

const About = () => {
  return (
    <div className="relative overflow-hidden bg-richblack-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-400/5 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-400/5 via-transparent to-transparent"></div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-richblack-800 to-richblack-900 overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-center text-white">
          <motion.header 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto py-20 text-4xl font-bold lg:w-[70%]"
          >
            <h1 className="text-5xl md:text-6xl leading-tight">
              Driving Innovation in Online Education for a
              <HighlightText text={"Brighter Future"} />
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-6 text-lg font-medium text-richblack-300 lg:w-[95%] leading-relaxed"
            >
              Edusphere is committed to transforming online education through
              innovation and quality learning experiences. Our mission is to
              build a brighter future by delivering modern, industry-relevant
              courses, using advanced technologies, and fostering a strong and
              supportive learning community. We focus on empowering learners
              with the knowledge and skills they need to grow, succeed, and lead
              in a rapidly changing world.
            </motion.p>
          </motion.header>

          {/* Banner Images */}
          <div className="relative h-[100px] lg:h-[150px]"></div>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute bottom-0 left-[50%] grid w-[90%] lg:w-[80%] translate-x-[-50%] translate-y-[30%] grid-cols-3 gap-3 lg:gap-6"
          >
            {[BannerImage1, BannerImage2, BannerImage3].map((img, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="overflow-hidden rounded-xl shadow-2xl"
              >
                <img 
                  src={img} 
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="border-b border-richblack-700 bg-richblack-900">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-richblack-500">
          <div className="h-[180px] lg:h-[200px]"></div>
          <Quote />
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-richblack-900 py-20">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-16 text-richblack-500">
          {/* Founding Story */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-12 lg:flex-row justify-between"
          >
            <div className="flex lg:w-[50%] flex-col gap-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#833AB4] to-[#FCB045]">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h1 className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-4xl font-bold text-transparent">
                  Our Founding Story
                </h1>
              </div>
              <div className="space-y-6">
                <p className="text-lg font-medium text-richblack-300 leading-relaxed">
                  Our e-learning platform was born out of a shared vision and
                  passion for transforming education. It all began with a group of
                  educators, technologists, and lifelong learners who recognized
                  the need for accessible, flexible, and high-quality learning
                  opportunities in a rapidly evolving digital world.
                </p>
                <p className="text-lg font-medium text-richblack-300 leading-relaxed">
                  As experienced educators ourselves, we witnessed firsthand the
                  limitations and challenges of traditional education systems. We
                  believed that education should not be confined to the walls of a
                  classroom or restricted by geographical boundaries. We
                  envisioned a platform that could bridge these gaps and empower
                  individuals from all walks of life to unlock their full
                  potential.
                </p>
              </div>
            </div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex justify-center lg:justify-end lg:w-[50%]"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] rounded-lg blur opacity-50"></div>
                <img
                  src={FoundingStory}
                  alt="Founding Story"
                  className="relative w-[440px] lg:w-[560px] rounded-lg shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Vision & Mission */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
            {/* Vision Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700 hover:border-[#FF512F]/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF512F]/5 to-[#F09819]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF512F] to-[#F09819]">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="bg-gradient-to-b from-[#FF512F] to-[#F09819] bg-clip-text text-3xl font-bold text-transparent">
                    Our Vision
                  </h2>
                </div>
                <p className="text-lg text-richblack-300 leading-relaxed">
                  With this vision in mind, we set out on a journey to create an
                  e-learning platform that would revolutionize the way people
                  learn. Our team of dedicated experts worked tirelessly to
                  develop a robust and intuitive platform that combines
                  cutting-edge technology with engaging content, fostering a
                  dynamic and interactive learning experience.
                </p>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700 hover:border-[#1FA2FF]/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1FA2FF]/5 to-[#A6FFCB]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#1FA2FF] to-[#A6FFCB]">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] bg-clip-text text-3xl font-bold text-transparent">
                    Our Mission
                  </h2>
                </div>
                <p className="text-lg text-richblack-300 leading-relaxed">
                  Our mission goes beyond just delivering courses online. We
                  wanted to create a vibrant community of learners, where
                  individuals can connect, collaborate, and learn from one
                  another. We believe that knowledge thrives in an environment of
                  sharing and dialogue, and we foster this spirit of collaboration
                  through forums, live sessions, and networking opportunities.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsComponenet />

      {/* Learning Grid & Contact Section */}
      <section className="mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-16 text-white">
        <LearningGrid />
        <ContactFormSection />
      </section>

      {/* Reviews Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto my-20 w-11/12 max-w-maxContent"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-12 border border-richblack-700">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-richblack-700/50 rounded-full px-4 py-2 border border-richblack-600 mb-4">
                <Award className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-richblack-200">Student Testimonials</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                What Our Learners Say
              </h2>
              <p className="mt-3 text-richblack-300 max-w-2xl mx-auto">
                Join thousands of satisfied students who have transformed their careers with our courses
              </p>
            </div>
            <ReviewSlider />
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default About;
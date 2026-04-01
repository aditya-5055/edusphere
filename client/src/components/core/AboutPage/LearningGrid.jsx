

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Award, TrendingUp, Star, Briefcase, Sparkles } from 'lucide-react';
import HighlightText from "../../../components/core/HomePage/HighlightText";
import CTAButton from "../../../components/core/HomePage/Button";

// Data array containing grid card information
const LearningGridArray = [
  {
    order: -1,
    heading: "World-Class Learning for",
    highliteText: "Anyone, Anywhere",
    description:
      "EduSphere partners with more than 275+ leading universities and companies to bring flexible, affordable, job-relevant online learning to individuals and organizations worldwide.",
    BtnText: "Learn More",
    BtnLink: "/",
    icon: Sparkles,
    gradient: "from-yellow-400 to-yellow-200"
  },
  {
    order: 1,
    heading: "Curriculum Based on Industry Needs",
    description:
      "Save time and money! The Belajar curriculum is made to be easier to understand and in line with industry needs.",
    icon: BookOpen,
    gradient: "from-blue-400 to-blue-200"
  },
  {
    order: 2,
    heading: "Our Learning Methods",
    description:
      "EduSphere partners with more than 275+ leading universities and companies to bring",
    icon: TrendingUp,
    gradient: "from-green-400 to-green-200"
  },
  {
    order: 3,
    heading: "Certification",
    description:
      "EduSphere partners with more than 275+ leading universities and companies to bring",
    icon: Award,
    gradient: "from-purple-400 to-purple-200"
  },
  {
    order: 4,
    heading: `Rating "Auto-grading"`,
    description:
      "EduSphere partners with more than 275+ leading universities and companies to bring",
    icon: Star,
    gradient: "from-orange-400 to-orange-200"
  },
  {
    order: 5,
    heading: "Ready to Work",
    description:
      "EduSphere partners with more than 275+ leading universities and companies to bring",
    icon: Briefcase,
    gradient: "from-red-400 to-red-200"
  },
];

const LearningGrid = () => {
  return (
    <div className="grid mx-auto w-[350px] xl:w-fit grid-cols-1 xl:grid-cols-4 gap-6 mb-12">
      {LearningGridArray.map((card, i) => {
        const Icon = card.icon;
        const isFeatured = card.order < 0;
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`group relative overflow-hidden rounded-2xl ${
              isFeatured 
                ? "xl:col-span-2 bg-gradient-to-br from-richblack-800 to-richblack-900 border-2 border-yellow-400/20 hover:border-yellow-400/40" 
                : card.order % 2 === 1
                  ? "bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700 hover:border-yellow-400/30"
                  : "bg-gradient-to-br from-richblack-900 to-richblack-800 border border-richblack-700 hover:border-yellow-400/30"
            } ${card.order === 3 && "xl:col-start-2"} transition-all duration-300`}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Icon for non-featured cards */}
            {!isFeatured && (
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <Icon className={`h-16 w-16 text-white`} />
              </div>
            )}

            <div className="relative z-10 p-8 h-full flex flex-col">
              {isFeatured ? (
                // Featured card content
                <div className="flex flex-col gap-6 h-full">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient}`}>
                      <Icon className="h-6 w-6 text-richblack-900" />
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {card.heading}
                      <HighlightText text={card.highliteText} />
                    </div>
                  </div>
                  
                  <p className="text-lg text-richblack-300 leading-relaxed">
                    {card.description}
                  </p>

                  <div className="mt-auto pt-6">
                    <CTAButton active={true} linkto={card.BtnLink}>
                      {card.BtnText}
                    </CTAButton>
                  </div>
                </div>
              ) : (
                // Regular card content
                <div className="flex flex-col gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} w-fit`}>
                    <Icon className="h-5 w-5 text-richblack-900" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-yellow-200 transition-all duration-300">
                    {card.heading}
                  </h3>
                  <p className="text-richblack-300 leading-relaxed">
                    {card.description}
                  </p>
                  
                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${card.gradient} flex items-center justify-center`}>
                      <span className="text-richblack-900 text-lg">→</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom gradient line on hover */}
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LearningGrid;
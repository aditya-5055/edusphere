import React from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, BookOpen, Award, TrendingUp } from 'lucide-react';

const Stats = [
  { count: "5K", label: "Active Students", icon: Users, gradient: "from-blue-400 to-blue-200" },
  { count: "10+", label: "Mentors", icon: UserCheck, gradient: "from-green-400 to-green-200" },
  { count: "200+", label: "Courses", icon: BookOpen, gradient: "from-purple-400 to-purple-200" },
  { count: "50+", label: "Awards", icon: Award, gradient: "from-yellow-400 to-yellow-200" },
];

const StatsComponenet = () => {
  return (
    <div className="relative bg-gradient-to-r from-richblack-800 to-richblack-900 py-16 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
      </div>

      <div className="relative mx-auto w-11/12 max-w-maxContent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative p-8 text-center rounded-2xl bg-richblack-800/50 border border-richblack-700 group-hover:border-yellow-400/30 transition-all duration-300">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${stat.gradient} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-richblack-900" />
                  </div>

                  {/* Count with animation */}
                  <motion.h1 
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, delay: index * 0.1 + 0.2 }}
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mb-2"
                  >
                    {stat.count}
                  </motion.h1>

                  {/* Label */}
                  <h2 className="text-lg font-medium text-richblack-300 group-hover:text-richblack-200 transition-colors duration-300">
                    {stat.label}
                  </h2>

                  {/* Decorative element */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional stats note */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-richblack-400">
            <TrendingUp className="h-5 w-5 text-yellow-400" />
            <p className="text-sm">And growing every day</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StatsComponenet;
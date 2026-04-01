

import { useEffect, useState } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Clock, 
  Award, 
  PlayCircle, 
  TrendingUp,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Calendar,
  BarChart3
} from "lucide-react";

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filter, setFilter] = useState("all"); // all, in-progress, completed

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserEnrolledCourses(token);
        const filterPublishCourse = res.filter((ele) => ele.status !== "Draft");
        setEnrolledCourses(filterPublishCourse);
      } catch (error) {
        console.log("Could not fetch enrolled courses.");
      }
    })();
  }, [token]);

  // Filter courses based on progress
  const getFilteredCourses = () => {
    if (!enrolledCourses) return [];
    
    switch(filter) {
      case "in-progress":
        return enrolledCourses.filter(course => 
          (course.progressPercentage || 0) > 0 && (course.progressPercentage || 0) < 100
        );
      case "completed":
        return enrolledCourses.filter(course => (course.progressPercentage || 0) === 100);
      default:
        return enrolledCourses;
    }
  };

  const filteredCourses = getFilteredCourses();
  const stats = {
    total: enrolledCourses?.length || 0,
    inProgress: enrolledCourses?.filter(c => (c.progressPercentage || 0) > 0 && (c.progressPercentage || 0) < 100).length || 0,
    completed: enrolledCourses?.filter(c => (c.progressPercentage || 0) === 100).length || 0,
    averageProgress: enrolledCourses?.reduce((acc, c) => acc + (c.progressPercentage || 0), 0) / (enrolledCourses?.length || 1) || 0
  };

  if (!enrolledCourses) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-richblack-700 border-t-yellow-400 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>
    );
  }

  if (!enrolledCourses.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        {/* Empty State Illustration */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-200/20 rounded-full blur-3xl"></div>
          <div className="relative bg-richblack-800 p-8 rounded-full border border-richblack-700">
            <BookOpen className="h-16 w-16 text-richblack-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-richblack-5 mb-3">
          No Enrolled Courses Yet
        </h2>
        
        <p className="text-richblack-400 max-w-md mb-8">
          Start your learning journey today! Browse our catalog and enroll in courses that interest you.
        </p>

        
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-r from-yellow-400/20 to-yellow-200/20 p-3">
            <GraduationCap className="h-8 w-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
              My Learning
            </h1>
            <p className="text-richblack-400 mt-1">
              Continue your learning journey
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-richblack-800 rounded-lg p-3 border border-richblack-700">
            <p className="text-xs text-richblack-400">Total</p>
            <p className="text-xl font-bold text-richblack-5">{stats.total}</p>
          </div>
          <div className="bg-richblack-800 rounded-lg p-3 border border-richblack-700">
            <p className="text-xs text-richblack-400">In Progress</p>
            <p className="text-xl font-bold text-yellow-400">{stats.inProgress}</p>
          </div>
          <div className="bg-richblack-800 rounded-lg p-3 border border-richblack-700">
            <p className="text-xs text-richblack-400">Completed</p>
            <p className="text-xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-richblack-800 rounded-lg p-3 border border-richblack-700">
            <p className="text-xs text-richblack-400">Avg Progress</p>
            <p className="text-xl font-bold text-blue-400">{Math.round(stats.averageProgress)}%</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-richblack-700 pb-4">
        {[
          { id: "all", label: "All Courses", icon: BookOpen },
          { id: "in-progress", label: "In Progress", icon: TrendingUp },
          { id: "completed", label: "Completed", icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = filter === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive 
                  ? "text-yellow-400 bg-yellow-400/10" 
                  : "text-richblack-400 hover:text-richblack-100 hover:bg-richblack-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-200"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Courses Grid/List */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {filteredCourses.length === 0 ? (
            <motion.div
              key="empty-filter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-richblack-800 rounded-xl border border-richblack-700"
            >
              <p className="text-richblack-400">No courses match the selected filter</p>
            </motion.div>
          ) : (
            <motion.div
              key="courses-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredCourses.map((course, index) => {
                const progress = course.progressPercentage || 0;
                const isCompleted = progress === 100;
                
                return (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700 hover:border-yellow-400/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      navigate(
                        `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                      );
                    }}
                  >
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Course Image */}
                        <div className="lg:w-[280px] flex-shrink-0">
                          <div className="relative overflow-hidden rounded-xl aspect-video lg:aspect-auto lg:h-[160px]">
                            <img
                              src={course.thumbnail}
                              alt={course.courseName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-richblack-900 via-transparent to-transparent"></div>
                            
                            {/* Play overlay on hover */}
                            <div className="absolute inset-0 bg-richblack-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <PlayCircle className="h-12 w-12 text-yellow-400" />
                            </div>

                            {/* Status badge */}
                            <div className="absolute top-2 right-2">
                              {isCompleted ? (
                                <span className="px-2 py-1 text-xs font-medium bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full text-green-400">
                                  Completed
                                </span>
                              ) : progress > 0 ? (
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-full text-yellow-400">
                                  In Progress
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium bg-richblack-700/80 backdrop-blur-sm border border-richblack-600 rounded-full text-richblack-300">
                                  Not Started
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Course Details */}
                        <div className="flex-1 space-y-4">
                          {/* Title and Description */}
                          <div>
                            <h3 className="text-xl font-bold text-richblack-5 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-yellow-200 transition-all duration-300">
                              {course.courseName}
                            </h3>
                            <p className="text-sm text-richblack-400 line-clamp-2">
                              {course.courseDescription}
                            </p>
                          </div>

                          {/* Course Meta Info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-richblack-400">
                              <BookOpen className="h-4 w-4" />
                              <span>{course.courseContent?.length || 0} sections</span>
                            </div>
                            <div className="flex items-center gap-1 text-richblack-400">
                              <Clock className="h-4 w-4" />
                              <span>{course?.totalDuration || "Self-paced"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-richblack-400">
                              <BarChart3 className="h-4 w-4" />
                              <span>Level: {course?.level || "Beginner"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-richblack-400">
                              <Calendar className="h-4 w-4" />
                              <span>Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Progress Section */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-richblack-400">Progress</span>
                              <span className="font-medium text-yellow-400">{progress}%</span>
                            </div>
                            <ProgressBar
                              completed={progress}
                              height="8px"
                              isLabelVisible={false}
                              bgColor={isCompleted ? "#22c55e" : "#fbbf24"}
                              baseBgColor="#2c333f"
                              className="rounded-full overflow-hidden"
                            />
                            
                            {/* Next milestone */}
                            {!isCompleted && (
                              <p className="text-xs text-richblack-500 flex items-center gap-1 mt-1">
                                <Sparkles className="h-3 w-3" />
                                {progress < 30 ? "Start your journey" : 
                                 progress < 70 ? "Keep going! You're making progress" : 
                                 "Almost there! Complete to earn certificate"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right Arrow Indicator */}
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-2">
                          <ChevronRight className="h-6 w-6 text-yellow-400" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom gradient line */}
                    <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${
                      isCompleted 
                        ? "from-green-400 to-green-200" 
                        : progress > 0 
                          ? "from-yellow-400 to-yellow-200" 
                          : "from-richblack-600 to-richblack-500"
                    } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Learning Insights */}
      {enrolledCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 p-6 rounded-xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-400/20">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-richblack-5">Learning Insights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-richblack-400">Total Learning Time</p>
              <p className="text-2xl font-bold text-richblack-5">128 hours</p>
              <p className="text-xs text-green-400">↑ 12% from last month</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-richblack-400">Courses Completed</p>
              <p className="text-2xl font-bold text-richblack-5">{stats.completed}</p>
              <p className="text-xs text-richblack-400">Keep up the momentum!</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-richblack-400">Certificates Earned</p>
              <p className="text-2xl font-bold text-richblack-5">{stats.completed}</p>
              <p className="text-xs text-yellow-400">Showcase your achievements</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
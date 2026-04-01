
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  BookOpen, 
  Users, 
  IndianRupee,
  TrendingUp,
  PlusCircle,
  ChevronRight,
  Loader2
} from 'lucide-react'

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../services/operations/profileAPI"
import InstructorChart from "./InstructorDashboard/InstructorChart"

export default function Instructor() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const instructorApiData = await getInstructorData(token)
      const result = await fetchInstructorCourses(token)
      console.log(instructorApiData)
      if (instructorApiData?.length) setInstructorData(instructorApiData)
      if (result) {
        setCourses(result)
      }
      setLoading(false)
    })()
  }, [token])

  const totalAmount = instructorData?.reduce(
    (acc, curr) => acc + curr.totalAmountGenerated,
    0
  )

  const totalStudents = instructorData?.reduce(
    (acc, curr) => acc + curr.totalStudentsEnrolled,
    0
  )

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-richblack-700 border-t-yellow-400 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 p-4 md:p-6"
    >
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-8 border border-richblack-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
            Hi {user?.firstName} 👋
          </h1>
          <p className="mt-2 text-lg text-richblack-300 max-w-2xl">
            Welcome back to your instructor dashboard. Let's check your course performance and create something amazing today.
          </p>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-8">
          {/* Chart and Statistics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2">
              {totalAmount > 0 || totalStudents > 0 ? (
                <InstructorChart courses={instructorData} />
              ) : (
                <div className="h-full rounded-xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-8 border border-richblack-700 flex flex-col items-center justify-center text-center">
                  <TrendingUp className="h-16 w-16 text-richblack-600 mb-4" />
                  <p className="text-2xl font-bold text-richblack-50">Not Enough Data</p>
                  <p className="mt-2 text-richblack-400">Start enrolling students to see analytics</p>
                </div>
              )}
            </div>

            {/* Statistics Cards */}
            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-6 border border-richblack-700">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-lg font-bold text-richblack-5">Quick Stats</p>
                  <div className="h-10 w-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Total Courses Card */}
                  <div className="group relative overflow-hidden rounded-lg bg-richblack-700/50 p-4 border border-richblack-600 hover:border-yellow-400/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:to-transparent transition-all duration-500"></div>
                    <div className="relative flex items-start justify-between">
                      <div>
                        <p className="text-sm text-richblack-300 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Total Courses
                        </p>
                        <p className="mt-2 text-3xl font-bold text-richblack-50">
                          {courses.length}
                        </p>
                      </div>
                      <div className="rounded-full bg-yellow-400/10 p-2">
                        <BookOpen className="h-5 w-5 text-yellow-400" />
                      </div>
                    </div>
                  </div>

                  {/* Total Students Card */}
                  <div className="group relative overflow-hidden rounded-lg bg-richblack-700/50 p-4 border border-richblack-600 hover:border-yellow-400/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:to-transparent transition-all duration-500"></div>
                    <div className="relative flex items-start justify-between">
                      <div>
                        <p className="text-sm text-richblack-300 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Total Students
                        </p>
                        <p className="mt-2 text-3xl font-bold text-richblack-50">
                          {totalStudents}
                        </p>
                      </div>
                      <div className="rounded-full bg-blue-400/10 p-2">
                        <Users className="h-5 w-5 text-blue-400" />
                      </div>
                    </div>
                  </div>

                  {/* Total Income Card */}
                  <div className="group relative overflow-hidden rounded-lg bg-richblack-700/50 p-4 border border-richblack-600 hover:border-yellow-400/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:to-transparent transition-all duration-500"></div>
                    <div className="relative flex items-start justify-between">
                      <div>
                        <p className="text-sm text-richblack-300 flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          Total Income
                        </p>
                        <p className="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                          ₹{totalAmount?.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-full bg-green-400/10 p-2">
                        <IndianRupee className="h-5 w-5 text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Courses Section */}
          <div className="rounded-xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-6 border border-richblack-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-1 bg-gradient-to-b from-yellow-400 to-yellow-200 rounded-full"></div>
                <p className="text-xl font-bold text-richblack-5">Your Recent Courses</p>
              </div>
              <Link to="/dashboard/my-courses">
                <button className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-richblack-700 text-yellow-400 hover:bg-richblack-600 transition-all duration-300">
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl bg-richblack-700/50 border border-richblack-600 hover:border-yellow-400/50 transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-richblack-900 via-transparent to-transparent"></div>
                    
                    {/* Course Stats Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full bg-richblack-900/80 backdrop-blur-sm px-3 py-1 text-sm">
                        <Users className="h-3.5 w-3.5 text-yellow-400" />
                        <span className="text-richblack-200">{course.studentsEnroled.length}</span>
                      </div>
                      <div className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200 px-3 py-1 text-sm font-semibold text-richblack-900">
                        ₹{course.price}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-richblack-5 line-clamp-1">
                      {course.courseName}
                    </h3>
                    
                    {/* Progress Bar (example - you can replace with actual progress) */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-richblack-400 mb-1">
                        <span>Enrollment Rate</span>
                        <span>{Math.min(100, Math.round((course.studentsEnroled.length / 50) * 100))}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-richblack-600 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((course.studentsEnroled.length / 50) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-12 border border-richblack-700 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent"></div>
          
          <div className="relative z-10">
            <div className="mx-auto h-24 w-24 rounded-full bg-richblack-700 flex items-center justify-center mb-6">
              <BookOpen className="h-12 w-12 text-yellow-400" />
            </div>
            
            <h2 className="text-3xl font-bold text-richblack-5 mb-3">
              No Courses Yet
            </h2>
            
            <p className="text-richblack-300 max-w-md mx-auto mb-8">
              Start your teaching journey today. Create your first course and share your knowledge with students worldwide.
            </p>
            
            <Link to="/dashboard/add-course">
              <button className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-200 text-richblack-900 font-bold hover:from-yellow-300 hover:to-yellow-100 transition-all duration-300 shadow-lg shadow-yellow-500/30">
                <PlusCircle className="h-5 w-5" />
                <span>Create Your First Course</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
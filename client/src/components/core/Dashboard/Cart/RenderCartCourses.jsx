

import { FaStar } from "react-icons/fa"
import { RiDeleteBin6Line } from "react-icons/ri"
import ReactStars from "react-rating-stars-component"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Clock, Users } from 'lucide-react'

import { removeFromCart } from "../../../../slices/cartSlice"

export default function RenderCartCourses() {
  const { cart } = useSelector((state) => state.cart)
  const dispatch = useDispatch()

  const handleRemove = (courseId) => {
    dispatch(removeFromCart(courseId))
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {cart.map((course, index) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700 hover:border-yellow-400/30 transition-all duration-300"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Course Image */}
                <div className="lg:w-[240px] flex-shrink-0">
                  <div className="relative overflow-hidden rounded-xl aspect-video lg:aspect-auto lg:h-[140px]">
                    <img
                      src={course?.thumbnail}
                      alt={course?.courseName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-richblack-900 via-transparent to-transparent"></div>
                    
                    {/* Course level badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-1 text-xs font-medium bg-richblack-900/80 backdrop-blur-sm rounded-md text-richblack-300">
                        {course?.level || "Beginner"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="flex-1 space-y-4">
                  {/* Title and Category */}
                  <div>
                    <h3 className="text-xl font-bold text-richblack-5 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-yellow-200 transition-all duration-300">
                      {course?.courseName}
                    </h3>
                    <p className="text-sm text-richblack-400 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {course?.category?.name || "Uncategorized"}
                    </p>
                  </div>

                  {/* Course Stats */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 font-semibold">4.5</span>
                        <ReactStars
                          count={5}
                          value={4.5}
                          size={18}
                          edit={false}
                          activeColor="#fbbf24"
                          emptyIcon={<FaStar className="text-richblack-600" />}
                          fullIcon={<FaStar className="text-yellow-400" />}
                        />
                      </div>
                      <span className="text-xs text-richblack-400">
                        ({course?.ratingAndReviews?.length || 0} reviews)
                      </span>
                    </div>

                    {/* Students Enrolled */}
                    <div className="flex items-center gap-1 text-richblack-400">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">
                        {course?.studentsEnrolled?.length || 0} students
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1 text-richblack-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">
                        {course?.duration || "Self-paced"}
                      </span>
                    </div>
                  </div>

                  {/* Course Description Preview */}
                  <p className="text-sm text-richblack-400 line-clamp-2">
                    {course?.description || "No description available"}
                  </p>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 lg:gap-6">
                  {/* Price */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                      ₹{course?.price?.toLocaleString()}
                    </p>
                    {course?.originalPrice && (
                      <p className="text-xs text-richblack-500 line-through">
                        ₹{course.originalPrice.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <motion.button
                    onClick={() => handleRemove(course._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300 group/btn"
                  >
                    <RiDeleteBin6Line className="text-lg group-hover/btn:rotate-12 transition-transform" />
                    <span className="text-sm font-medium">Remove</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Cart Summary for Mobile */}
      {cart.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-richblack-800/50 border border-richblack-700 lg:hidden">
          <p className="text-sm text-richblack-400">
            {cart.length} {cart.length === 1 ? 'course' : 'courses'} in cart
          </p>
        </div>
      )}
    </div>
  )
}
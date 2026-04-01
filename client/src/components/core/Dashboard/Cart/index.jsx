

import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, AlertCircle } from 'lucide-react'

import RenderCartCourses from "./RenderCartCourses"
import RenderTotalAmount from "./RenderTotalAmount"

export default function Cart() {
  const { total, totalItems } = useSelector((state) => state.cart)
  const { paymentLoading } = useSelector((state) => state.course)
  const { user } = useSelector((state) => state.profile);
  if (paymentLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-richblack-700 border-t-yellow-400 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-yellow-400" />
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
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-richblack-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-r from-yellow-400/20 to-yellow-200/20 p-3">
            <ShoppingCart className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
              Your Cart
            </h1>
            <p className="text-sm text-richblack-400 mt-1">
              {totalItems} {totalItems === 1 ? 'Course' : 'Courses'} in Cart
            </p>
          </div>
        </div>
        
        {/* Cart Summary Badge */}
        <div className="hidden md:flex items-center gap-2 bg-richblack-800 px-4 py-2 rounded-full border border-richblack-700">
          <span className="text-richblack-300">Total Items:</span>
          <span className="font-bold text-yellow-400">{totalItems}</span>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {total > 0 ? (
          <motion.div
            key="cart-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-8 flex flex-col-reverse items-start gap-8 lg:flex-row"
          >
            {/* Cart Courses */}
            <div className="flex-1 w-full">
              <RenderCartCourses />
            </div>

            {/* Total Amount Sidebar */}
            <div className="lg:w-[320px] w-full">
              <RenderTotalAmount />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty-cart"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            {/* Empty State Illustration */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-200/20 rounded-full blur-3xl"></div>
              <div className="relative bg-richblack-800 p-8 rounded-full border border-richblack-700">
                <ShoppingCart className="h-16 w-16 text-richblack-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-richblack-5 mb-3">
              Your cart is empty
            </h2>
            
            <p className="text-richblack-400 max-w-md mb-8">
              Looks like you haven't added any courses to your cart yet. 
              Explore our courses and start learning today!
            </p>

            <div className="flex items-center gap-2 text-sm text-richblack-500 bg-richblack-800 px-4 py-2 rounded-full">
              <AlertCircle className="h-4 w-4" />
              <span>Add courses to get started</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
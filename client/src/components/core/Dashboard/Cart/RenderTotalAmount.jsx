
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CreditCard, Shield, Truck, Clock, AlertCircle, Lock } from 'lucide-react'

import { BuyCourse } from "../../../../services/operations/studentFeaturesAPI"
import IconBtn from "../../../Common/IconBtn"

export default function RenderTotalAmount() {
  const { total, cart } = useSelector((state) => state.cart)
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleBuyCourse = () => {
    const courses = cart.map((course) => course._id)
    // Uncomment when payment integration is ready
    BuyCourse(token, courses, user, navigate, dispatch)
  }

  // Calculate savings if there are any discounts
  const originalTotal = cart.reduce((acc, course) => 
    acc + (course.originalPrice || course.price), 0
  )
  const savings = originalTotal - total

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-24"
    >
      <div className="rounded-xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-200/10 p-4 border-b border-richblack-700">
          <h3 className="text-lg font-semibold text-richblack-5 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-yellow-400" />
            Order Summary
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-richblack-400">Original Price</span>
              <span className="text-richblack-100">₹{originalTotal.toLocaleString()}</span>
            </div>
            
            {savings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-richblack-400">Savings</span>
                <span className="text-green-400">-₹{savings.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-richblack-400">Items</span>
              <span className="text-richblack-100">{cart.length}</span>
            </div>

            <div className="border-t border-richblack-700 my-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-richblack-300">Total</span>
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <IconBtn
            text="Proceed to Buy"
            onclick={handleBuyCourse}
            customClasses="w-full justify-center py-4 text-base font-semibold bg-gradient-to-r from-yellow-400 to-yellow-200 text-richblack-900 hover:from-yellow-300 hover:to-yellow-100 transition-all duration-300 shadow-lg shadow-yellow-400/30"
          />

          {/* Features */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm text-richblack-400">
              <Shield className="h-4 w-4 text-green-400" />
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-richblack-400">
              <Truck className="h-4 w-4 text-blue-400" />
              <span>Lifetime access</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-richblack-400">
              <Clock className="h-4 w-4 text-purple-400" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-richblack-400">
              <Lock className="h-4 w-4 text-yellow-400" />
              <span>SSL encrypted payment</span>
            </div>
          </div>

          {/* Payment Methods (Optional) */}
          <div className="pt-4 border-t border-richblack-700">
            <p className="text-xs text-richblack-500 text-center mb-3">
              We accept:
            </p>
            <div className="flex justify-center gap-3">
              <div className="px-3 py-1.5 bg-richblack-700 rounded-md text-xs font-medium text-richblack-300">
                Visa
              </div>
              <div className="px-3 py-1.5 bg-richblack-700 rounded-md text-xs font-medium text-richblack-300">
                Mastercard
              </div>
              <div className="px-3 py-1.5 bg-richblack-700 rounded-md text-xs font-medium text-richblack-300">
                UPI
              </div>
              <div className="px-3 py-1.5 bg-richblack-700 rounded-md text-xs font-medium text-richblack-300">
                PayPal
              </div>
            </div>
          </div>

          {/* Note for demo */}
          <div className="flex items-start gap-2 p-3 bg-yellow-400/5 border border-yellow-400/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-richblack-400">
              This is a demo checkout. In production, you'll be redirected to a secure payment gateway.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
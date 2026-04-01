
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { Send, AlertCircle, CheckCircle, Phone, Mail, User, MessageSquare } from 'lucide-react'
import toast from "react-hot-toast"
import CountryCode from "../../../data/countrycode.json"
import { apiConnector } from "../../../services/apiConnector"
import { contactusEndpoint } from "../../../services/apis"

const ContactUsForm = () => {
  const [loading, setLoading] = useState(false)
  const [formStatus, setFormStatus] = useState({ type: null, message: "" })
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useForm()

  const submitContactForm = async (data) => {
    try {
      setLoading(true)
      setFormStatus({ type: null, message: "" })
      
      const res = await apiConnector(
        "POST",
        contactusEndpoint.CONTACT_US_API,
        data
      )
            toast.success("Message sent! We'll get back to you soon.")

      setFormStatus({ 
        type: "success", 
        message: "Message sent successfully! We'll get back to you soon." 
      })
      setLoading(false)
    } catch (error) {
            toast.error("Something went wrong. Please try again.")

      setFormStatus({ 
        type: "error", 
        message: "Something went wrong. Please try again." 
      })
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        email: "",
        firstname: "",
        lastname: "",
        message: "",
        phoneNo: "",
      })
      
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setFormStatus({ type: null, message: "" })
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [reset, isSubmitSuccessful])

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(submitContactForm)}
    >
      {/* Status Message */}
      <AnimatePresence>
        {formStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              formStatus.type === "success" 
                ? "bg-green-500/10 border border-green-500/20 text-green-400" 
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {formStatus.type === "success" ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{formStatus.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <label htmlFor="firstname" className="block text-sm font-medium text-richblack-300">
            First Name <span className="text-yellow-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-richblack-400" />
            </div>
            <input
              type="text"
              id="firstname"
              placeholder="John"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
              {...register("firstname", { required: true })}
            />
          </div>
          {errors.firstname && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-pink-200 flex items-center gap-1"
            >
              <AlertCircle className="h-4 w-4" />
              First name is required
            </motion.p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label htmlFor="lastname" className="block text-sm font-medium text-richblack-300">
            Last Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-richblack-400" />
            </div>
            <input
              type="text"
              id="lastname"
              placeholder="Doe"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
              {...register("lastname")}
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-richblack-300">
          Email Address <span className="text-yellow-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-richblack-400" />
          </div>
          <input
            type="email"
            id="email"
            placeholder="john.doe@example.com"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
            {...register("email", { required: true })}
          />
        </div>
        {errors.email && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-pink-200 flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            Email is required
          </motion.p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <label htmlFor="phonenumber" className="block text-sm font-medium text-richblack-300">
          Phone Number <span className="text-yellow-400">*</span>
        </label>
        <div className="flex gap-3">
          <div className="w-32">
            <select
              className="w-full h-full rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-5 px-3 py-3 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
              {...register("countrycode", { required: true })}
            >
              {CountryCode.map((ele, i) => (
                <option key={i} value={ele.code} className="bg-richblack-800">
                  {ele.code} ({ele.country})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-richblack-400" />
            </div>
            <input
              type="tel"
              id="phonenumber"
              placeholder="12345 67890"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
              {...register("phoneNo", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10,12}$/,
                  message: "Please enter a valid phone number"
                }
              })}
            />
          </div>
        </div>
        {errors.phoneNo && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-pink-200 flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            {errors.phoneNo.message}
          </motion.p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-medium text-richblack-300">
          Message <span className="text-yellow-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
            <MessageSquare className="h-5 w-5 text-richblack-400" />
          </div>
          <textarea
            id="message"
            rows="5"
            placeholder="Tell us about your project, idea, or question..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-400 transition-colors duration-200 resize-none"
            {...register("message", { required: true })}
          />
        </div>
        {errors.message && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-pink-200 flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            Message is required
          </motion.p>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading || isSubmitting}
        type="submit"
        className="relative w-full py-4 px-6 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-200 text-richblack-900 font-semibold overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading || isSubmitting ? (
            <>
              <div className="h-5 w-5 border-2 border-richblack-900 border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </>
          ) : (
            <>
              Send Message
              <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </motion.button>
    </form>
  )
}

export default ContactUsForm
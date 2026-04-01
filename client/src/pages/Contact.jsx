 
import React from "react"
import { motion } from "framer-motion"
import { Mail, MapPin, Phone, MessageSquare, Star } from 'lucide-react'

import Footer from "../components/Common/Footer"
import ReviewSlider from "../components/Common/ReviewSlider"
import ContactDetails from "../components/core/ContactUsPage/ContactDetails"
import ContactForm from "../components/core/ContactUsPage/ContactForm"

const Contact = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-richblack-900">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-400/5 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-400/5 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-24 pb-12 text-center bg-gradient-to-b from-richblack-800/50 to-transparent">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mb-4"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-richblack-300 max-w-2xl mx-auto px-4"
          >
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
        </div>

        {/* Contact Section */}
        <div className="mx-auto mt-8 w-11/12 max-w-maxContent">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ContactDetails />
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="relative mx-auto my-20 w-11/12 max-w-maxContent">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-12 border border-richblack-700">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-richblack-700/50 rounded-full px-4 py-2 border border-richblack-600 mb-4">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-richblack-200">Learner Testimonials</span>
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
        </div>

        <Footer />
      </div>
    </div>
  )
}

export default Contact
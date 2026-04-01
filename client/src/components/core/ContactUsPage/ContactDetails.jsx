

import React from "react"
import { motion } from "framer-motion"
import { 
  MessageCircle, 
  Globe, 
  Phone, 
  Mail,
  MapPin,
  Clock,
  ChevronRight
} from 'lucide-react'

const contactDetails = [
  {
    icon: "MessageCircle",
    heading: "Email Us",
    description: "Our team is here to help you.",
    details: "noreply.edusphereacademy@gmail.com",
    bgColor: "from-blue-400/20 to-blue-400/5",
    iconColor: "text-blue-400",
    borderColor: "border-blue-400/20",
    lightIconColor: "text-blue-300",
    hoverBgColor: "group-hover:bg-blue-400/10"
  },
  {
    icon: "Globe",
    heading: "Visit Us",
    description: "Project location at PICT, Pune.",
    details: "Pune Institute of Computer Technology (PICT), Survey No. 27, Dhankawadi, Pune, Maharashtra 411043, India",
    bgColor: "from-purple-400/20 to-purple-400/5",
    iconColor: "text-purple-400",
    borderColor: "border-purple-400/20",
    lightIconColor: "text-purple-300",
    hoverBgColor: "group-hover:bg-purple-400/10"
  },
  {
    icon: "Phone",
    heading: "Support Hours",
    description: "Monday - Friday",
    details: "9:00 AM - 6:00 PM",
    bgColor: "from-green-400/20 to-green-400/5",
    iconColor: "text-green-400",
    borderColor: "border-green-400/20",
    lightIconColor: "text-green-300",
    hoverBgColor: "group-hover:bg-green-400/10"
  }
]

const getIcon = (iconName) => {
  switch(iconName) {
    case "MessageCircle":
      return MessageCircle
    case "Globe":
      return Globe
    case "Phone":
      return Phone
    default:
      return MessageCircle
  }
}

const ContactDetails = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          Contact Information
        </h3>
        <p className="text-richblack-300">
          Choose the way that's most convenient for you to reach us
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 gap-5">
        {contactDetails.map((item, index) => {
          const Icon = getIcon(item.icon)
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${item.bgColor} border ${item.borderColor} p-6 hover:shadow-lg transition-all duration-300 ${item.hoverBgColor}`}
            >
              {/* Background decoration */}
              <div className="absolute -right-10 -top-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-3 rounded-lg bg-richblack-800/80 backdrop-blur-sm border ${item.borderColor} group-hover:bg-richblack-800/60 transition-all duration-300`}>
                    <Icon className={`h-6 w-6 ${item.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-white transition-colors duration-300">
                      {item.heading}
                    </h4>
                    <p className="text-sm text-richblack-200 mb-2 group-hover:text-richblack-100 transition-colors duration-300">
                      {item.description}
                    </p>
                    
                    {/* Details with white text */}
                    <div className="flex items-start gap-2 mt-3 pt-3 border-t border-richblack-700">
                      {item.icon === "MessageCircle" && <Mail className="h-4 w-4 text-richblack-300 mt-0.5 group-hover:text-richblack-200 transition-colors duration-300" />}
                      {item.icon === "Globe" && <MapPin className="h-4 w-4 text-richblack-300 mt-0.5 flex-shrink-0 group-hover:text-richblack-200 transition-colors duration-300" />}
                      {item.icon === "Phone" && <Clock className="h-4 w-4 text-richblack-300 mt-0.5 group-hover:text-richblack-200 transition-colors duration-300" />}
                      
                      <p className="text-sm font-medium text-white group-hover:text-white transition-colors duration-300">
                        {item.details}
                      </p>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <ChevronRight className={`h-5 w-5 text-white/60 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 group-hover:text-white`} />
                </div>
              </div>

              {/* Hover effect line */}
              <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${item.icon === "MessageCircle" ? "from-blue-400 to-transparent" : item.icon === "Globe" ? "from-purple-400 to-transparent" : "from-green-400 to-transparent"} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </motion.div>
          )
        })}
      </div>

      {/* Additional Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 p-6 rounded-xl bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-yellow-400/20">
            <Clock className="h-5 w-5 text-yellow-300" />
          </div>
          <h4 className="font-semibold text-white">Response Time</h4>
        </div>
        <p className="text-sm text-richblack-200">
          We aim to respond to all inquiries within <span className="text-yellow-300 font-medium">24 hours</span> during business days. For urgent matters, please use the phone number above.
        </p>
      </motion.div>
    </div>
  )
}

export default ContactDetails
 


import { RiEditBoxLine } from "react-icons/ri"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users,
  MapPin,
  Globe,
  Award,
  BookOpen,
  Heart,
  Settings,
  ChevronRight
} from "lucide-react"

import { formattedDate } from "../../../utils/dateFormatter"
import IconBtn from "../../Common/IconBtn"

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-r from-yellow-400/20 to-yellow-200/20 p-3">
            <User className="h-8 w-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
              My Profile
            </h1>
            <p className="text-richblack-400 mt-1">
              Manage your personal information and account settings
            </p>
          </div>
        </div>

        {/* Quick Settings Link */}
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/dashboard/settings")}
          className="cursor-pointer hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-richblack-800 border border-richblack-700 text-richblack-300 hover:text-yellow-400 hover:border-yellow-400/30 transition-all duration-300"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </motion.div>

      {/* Profile Card */}
      <motion.div 
        variants={itemVariants}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700 p-8"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Profile Image with Gradient Border */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200 blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative">
                <img
                  src={user?.image}
                  alt={`profile-${user?.firstName}`}
                  className="aspect-square w-24 h-24 rounded-full object-cover border-4 border-richblack-800 group-hover:border-yellow-400/30 transition-all duration-300"
                />
                {/* Online Status Indicator */}
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-richblack-800"></div>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-richblack-5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-yellow-200 transition-all duration-300">
                {user?.firstName + " " + user?.lastName}
              </h2>
              <div className="flex items-center gap-2 text-richblack-400">
                <Mail className="h-4 w-4" />
                <p className="text-sm">{user?.email}</p>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-richblack-500">
                  <Award className="h-3 w-3" />
                  <span>Student</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-richblack-500">
                  <Calendar className="h-3 w-3" />
                  <span>Joined {formattedDate(user?.createdAt) || "Recently"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <IconBtn
            text="Edit Profile"
            onclick={() => navigate("/dashboard/settings")}
            customClasses="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-200 text-richblack-900 font-semibold rounded-lg hover:from-yellow-300 hover:to-yellow-100 transition-all duration-300 shadow-lg shadow-yellow-400/30 group/btn"
          >
            <RiEditBoxLine className="text-lg group-hover/btn:rotate-12 transition-transform" />
          </IconBtn>
        </div>

        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </motion.div>

      {/* About Section */}
      <motion.div 
        variants={itemVariants}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700 p-8"
      >
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-400/20 to-purple-200/20">
                <Heart className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-richblack-5">About Me</h3>
            </div>
            <IconBtn
              text="Edit"
              onclick={() => navigate("/dashboard/settings")}
              customClasses="px-4 py-2 bg-richblack-700 border border-richblack-600 text-richblack-300 hover:text-yellow-400 hover:border-yellow-400/30 rounded-lg transition-all duration-200"
            >
              <RiEditBoxLine className="text-sm" />
            </IconBtn>
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-0 text-6xl text-yellow-400/20 font-serif">"</div>
            <p
              className={`relative pl-4 text-base leading-relaxed ${
                user?.additionalDetails?.about
                  ? "text-richblack-100"
                  : "text-richblack-500 italic"
              }`}
            >
              {user?.additionalDetails?.about ?? "Write something about yourself to help others know you better..."}
            </p>
            <div className="absolute -right-4 bottom-0 text-6xl text-yellow-400/20 font-serif">"</div>
          </div>
        </div>
      </motion.div>

      {/* Personal Details Section */}
      <motion.div 
        variants={itemVariants}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700 p-8"
      >
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-400/20 to-blue-200/20">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-richblack-5">Personal Details</h3>
            </div>
            <IconBtn
              text="Edit"
              onclick={() => navigate("/dashboard/settings")}
              customClasses="px-4 py-2 bg-richblack-700 border border-richblack-600 text-richblack-300 hover:text-yellow-400 hover:border-yellow-400/30 rounded-lg transition-all duration-200"
            >
              <RiEditBoxLine className="text-sm" />
            </IconBtn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* First Name */}
              <div className="group/item">
                <label className="flex items-center gap-2 text-sm text-richblack-400 mb-2">
                  <User className="h-4 w-4" />
                  First Name
                </label>
                <p className="text-lg font-medium text-richblack-5 bg-richblack-700/30 px-4 py-3 rounded-lg border border-richblack-700 group-hover/item:border-yellow-400/30 transition-all duration-200">
                  {user?.firstName}
                </p>
              </div>

              {/* Email */}
              <div className="group/item">
                <label className="flex items-center gap-2 text-sm text-richblack-400 mb-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <p className="text-lg font-medium text-richblack-5 bg-richblack-700/30 px-4 py-3 rounded-lg border border-richblack-700 group-hover/item:border-yellow-400/30 transition-all duration-200">
                  {user?.email}
                </p>
              </div>

              {/* Gender */}
              <div className="group/item">
                <label className="flex items-center gap-2 text-sm text-richblack-400 mb-2">
                  <Users className="h-4 w-4" />
                  Gender
                </label>
                <p className={`text-lg font-medium ${
                  user?.additionalDetails?.gender 
                    ? "text-richblack-5" 
                    : "text-richblack-500 italic"
                } bg-richblack-700/30 px-4 py-3 rounded-lg border border-richblack-700 group-hover/item:border-yellow-400/30 transition-all duration-200`}>
                  {user?.additionalDetails?.gender ?? "Not specified"}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Last Name */}
              <div className="group/item">
                <label className="flex items-center gap-2 text-sm text-richblack-400 mb-2">
                  <User className="h-4 w-4" />
                  Last Name
                </label>
                <p className="text-lg font-medium text-richblack-5 bg-richblack-700/30 px-4 py-3 rounded-lg border border-richblack-700 group-hover/item:border-yellow-400/30 transition-all duration-200">
                  {user?.lastName}
                </p>
              </div>

              {/* Phone Number */}
              <div className="group/item">
                <label className="flex items-center gap-2 text-sm text-richblack-400 mb-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <p className={`text-lg font-medium ${
                  user?.additionalDetails?.contactNumber 
                    ? "text-richblack-5" 
                    : "text-richblack-500 italic"
                } bg-richblack-700/30 px-4 py-3 rounded-lg border border-richblack-700 group-hover/item:border-yellow-400/30 transition-all duration-200`}>
                  {user?.additionalDetails?.contactNumber ?? "Not added"}
                </p>
              </div>

              {/* Date of Birth */}
              <div className="group/item">
                <label className="flex items-center gap-2 text-sm text-richblack-400 mb-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </label>
                <p className={`text-lg font-medium ${
                  user?.additionalDetails?.dateOfBirth 
                    ? "text-richblack-5" 
                    : "text-richblack-500 italic"
                } bg-richblack-700/30 px-4 py-3 rounded-lg border border-richblack-700 group-hover/item:border-yellow-400/30 transition-all duration-200`}>
                  {formattedDate(user?.additionalDetails?.dateOfBirth) ?? "Not added"}
                </p>
              </div>
            </div>
          </div>

          
        </div>
      </motion.div>

   
    </motion.div>
  )
}
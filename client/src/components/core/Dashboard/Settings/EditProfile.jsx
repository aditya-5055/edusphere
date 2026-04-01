
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { User, Mail, Phone, Calendar, Users, Heart, X } from "lucide-react"

import { updateProfile } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../Common/IconBtn"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm()

  const submitProfileForm = async (data) => {
    try {
      await dispatch(updateProfile(token, data))
      navigate("/dashboard/my-profile")
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit(submitProfileForm)}
      className="space-y-6"
    >
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700 p-8">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-400/20 to-blue-200/20">
              <User className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-richblack-5">
              Profile Information
            </h2>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-richblack-300">
                  <User className="h-4 w-4" />
                  First Name <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  className="w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
                  {...register("firstName", { required: true })}
                  defaultValue={user?.firstName}
                />
                {errors.firstName && (
                  <p className="text-sm text-pink-200 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    First name is required
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-richblack-300">
                  <User className="h-4 w-4" />
                  Last Name <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  className="w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
                  {...register("lastName", { required: true })}
                  defaultValue={user?.lastName}
                />
                {errors.lastName && (
                  <p className="text-sm text-pink-200 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    Last name is required
                  </p>
                )}
              </div>
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-richblack-300">
                  <Calendar className="h-4 w-4" />
                  Date of Birth <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
                  {...register("dateOfBirth", {
                    required: "Date of birth is required",
                    max: {
                      value: new Date().toISOString().split("T")[0],
                      message: "Date of birth cannot be in the future",
                    },
                  })}
                  defaultValue={user?.additionalDetails?.dateOfBirth}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-pink-200 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-richblack-300">
                  <Users className="h-4 w-4" />
                  Gender <span className="text-yellow-400">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
                  {...register("gender", { required: true })}
                  defaultValue={user?.additionalDetails?.gender}
                >
                  {genders.map((ele, i) => (
                    <option key={i} value={ele} className="bg-richblack-800">
                      {ele}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="text-sm text-pink-200 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    Please select your gender
                  </p>
                )}
              </div>
            </div>

            {/* Contact Number and About */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-richblack-300">
                  <Phone className="h-4 w-4" />
                  Contact Number <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter contact number"
                  className="w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
                  {...register("contactNumber", {
                    required: "Contact number is required",
                    pattern: {
                      value: /^[0-9]{10,12}$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  defaultValue={user?.additionalDetails?.contactNumber}
                />
                {errors.contactNumber && (
                  <p className="text-sm text-pink-200 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>

              {/* About */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-richblack-300">
                  <Heart className="h-4 w-4" />
                  About <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tell us about yourself"
                  className="w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-400 transition-colors duration-200"
                  {...register("about", { required: true })}
                  defaultValue={user?.additionalDetails?.about}
                />
                {errors.about && (
                  <p className="text-sm text-pink-200 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    Please tell us about yourself
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard/my-profile")}
          className="px-6 py-3 rounded-lg border border-richblack-600 bg-richblack-700 text-richblack-200 font-medium hover:bg-richblack-600 hover:border-yellow-400/30 transition-all duration-200"
        >
          Cancel
        </button>
        <IconBtn
          type="submit"
          text="Save Changes"
          disabled={!isDirty}
          customClasses={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
            isDirty
              ? "bg-gradient-to-r from-yellow-400 to-yellow-200 text-richblack-900 hover:from-yellow-300 hover:to-yellow-100 shadow-lg shadow-yellow-400/30"
              : "bg-richblack-600 text-richblack-400 cursor-not-allowed"
          }`}
        />
      </div>
    </motion.form>
  )
}
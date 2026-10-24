
import { useEffect, useRef, useState } from "react"
import { FiUpload } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Camera, Image, X } from "lucide-react"

import { updateDisplayPicture } from "../../../../services/operations/SettingsAPI"
import { uploadToCloudinary } from "../../../../utils/cloudinaryUpload"
import { toast } from "react-hot-toast"
import IconBtn from "../../../Common/IconBtn"

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(null)
  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      previewFile(file)
    }
  }

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  const handleFileUpload = async () => {
    try {
      setLoading(true)
      const uploadRes = await uploadToCloudinary({
        file: imageFile,
        folderType: "profile",
        resourceType: "image",
        token,
      })

      const payload = {
        displayPictureUrl: uploadRes.secure_url,
      }

      dispatch(updateDisplayPicture(token, payload)).then(() => {
        setLoading(false)
        setImageFile(null)
      })
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
      toast.error(error.message || "Failed to upload image")
      setLoading(false)
    }
  }

  const handleClearImage = () => {
    setImageFile(null)
    setPreviewSource(null)
    fileInputRef.current.value = ""
  }

  useEffect(() => {
    if (imageFile) {
      previewFile(imageFile)
    }
  }, [imageFile])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 border border-richblack-700 p-8"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Profile Image with Upload Overlay */}
          <div className="relative group/image">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200 blur-md opacity-50 group-hover/image:opacity-75 transition-opacity duration-300"></div>
            <div className="relative">
              <img
                src={previewSource || user?.image}
                alt={`profile-${user?.firstName}`}
                className="aspect-square w-24 h-24 rounded-full object-cover border-4 border-richblack-800 group-hover/image:border-yellow-400/30 transition-all duration-300"
              />
              
              {/* Camera overlay on hover */}
              <div className="absolute inset-0 rounded-full bg-richblack-900/60 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="h-8 w-8 text-yellow-400" />
              </div>

              {/* Clear image button when preview exists */}
              {previewSource && previewSource !== user?.image && (
                <button
                  onClick={handleClearImage}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500/90 hover:bg-red-500 transition-colors duration-200"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Upload Info */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-richblack-5">
              Profile Picture
            </h3>
            <p className="text-sm text-richblack-400 max-w-md">
              Upload a clear photo of yourself. This will be displayed on your profile and in course discussions.
            </p>
            
            {/* File requirements */}
            <div className="flex items-center gap-2 text-xs text-richblack-500">
              <Image className="h-3 w-3" />
              <span>JPG, PNG, GIF • Max 5MB</span>
            </div>
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/gif, image/jpeg"
          />
          
          <button
            onClick={handleClick}
            disabled={loading}
            className="px-6 py-3 rounded-lg border border-richblack-600 bg-richblack-700 text-richblack-200 font-medium hover:bg-richblack-600 hover:border-yellow-400/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Select Image
          </button>

          {imageFile && (
            <IconBtn
              text={loading ? "Uploading..." : "Upload"}
              onclick={handleFileUpload}
              disabled={loading}
              customClasses="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-200 text-richblack-900 font-semibold rounded-lg hover:from-yellow-300 hover:to-yellow-100 transition-all duration-300 shadow-lg shadow-yellow-400/30 disabled:opacity-50"
            >
              {!loading && <FiUpload className="text-lg" />}
            </IconBtn>
          )}
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </motion.div>
  )
}
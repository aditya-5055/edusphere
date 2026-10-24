const cloudinary = require("cloudinary").v2
const User = require("../models/User")

const ALLOWED_FOLDER_TYPES = {
  profile: {
    folder: (base) => base,
    roles: ["Student", "Instructor", "Admin"],
    resourceTypes: ["image", "auto"],
  },
  "course-thumbnail": {
    folder: (base) => base,
    roles: ["Instructor", "Admin"],
    resourceTypes: ["image", "auto"],
  },
  "course-video": {
    folder: (base) => base,
    roles: ["Instructor", "Admin"],
    resourceTypes: ["video", "auto"],
  },
  "course-note": {
    folder: (base) => `${base}/course-notes`,
    roles: ["Instructor", "Admin"],
    resourceTypes: ["raw", "auto", "image"],
  },
  "live-recording": {
    folder: (base) => `${base}/live-recordings`,
    roles: ["Instructor", "Admin"],
    resourceTypes: ["video", "auto"],
  },
  "live-chat": {
    folder: (base) => `${base}/live-chat`,
    roles: ["Student", "Instructor", "Admin"],
    resourceTypes: ["image", "auto", "raw"],
  },
}

exports.generateUploadSignature = async (req, res) => {
  try {
    const userId = req.user.id
    const { folderType = "profile", resourceType = "auto" } = req.body

    const config = ALLOWED_FOLDER_TYPES[folderType]
    if (!config) {
      return res.status(400).json({
        success: false,
        message: `Invalid folderType. Allowed types: ${Object.keys(ALLOWED_FOLDER_TYPES).join(", ")}`,
      })
    }

    const user = await User.findById(userId).select("accountType")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    if (!config.roles.includes(user.accountType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${config.roles.join(", ")} can upload to ${folderType}`,
      })
    }

    const baseFolder = process.env.FOLDER_NAME || "EduSphere"
    const targetFolder = config.folder(baseFolder)
    const timestamp = Math.round(new Date().getTime() / 1000)

    const paramsToSign = {
      folder: targetFolder,
      timestamp,
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUD_API_SECRET
    )

    return res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        folder: targetFolder,
        apiKey: process.env.CLOUD_API_KEY,
        cloudName: process.env.CLOUD_NAME,
        resourceType,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate upload signature",
      error: error.message,
    })
  }
}

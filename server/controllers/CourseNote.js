const cloudinary = require("cloudinary").v2
const https = require("https")
const http = require("http")

const Course = require("../models/Course")
const CourseNote = require("../models/CourseNote")
const User = require("../models/User")

const MAX_NOTE_SIZE_BYTES = 15 * 1024 * 1024
const ALLOWED_NOTE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]

const DOCUMENT_MIME_TYPES = new Set(ALLOWED_NOTE_TYPES)

const MIME_TO_EXT = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt",
}

const getFileExtension = (fileName, mimeType) => {
  if (typeof fileName === "string" && fileName.includes(".")) {
    return fileName.split(".").pop().toLowerCase()
  }

  return MIME_TO_EXT[mimeType] || "pdf"
}

const inferResourceType = (note) => {
  if (note?.resourceType) {
    return note.resourceType
  }

  if (DOCUMENT_MIME_TYPES.has(note?.fileType)) {
    return "raw"
  }

  if (typeof note?.fileUrl === "string" && note.fileUrl.includes("/image/upload/")) {
    return "image"
  }

  return "raw"
}

const buildAppAssetUrls = (req, noteId) => {
  const origin = `${req.protocol}://${req.get("host")}`
  return {
    previewUrl: `${origin}/api/v1/course/note/${noteId}/access?mode=preview`,
    downloadUrl: `${origin}/api/v1/course/note/${noteId}/access?mode=download`,
  }
}

const proxyRemoteFile = (remoteUrl, res, fileName, fileType, mode) => {
  const isHttp = remoteUrl.startsWith("http://")
  const client = isHttp ? http : https

  const upstreamRequest = client.get(remoteUrl, (upstreamResponse) => {
    const statusCode = upstreamResponse.statusCode || 500

    if (statusCode >= 300 && statusCode < 400 && upstreamResponse.headers.location) {
      upstreamResponse.resume() // Consume response data to free up memory
      return proxyRemoteFile(upstreamResponse.headers.location, res, fileName, fileType, mode)
    }

    if (statusCode >= 400) {
      res.status(statusCode).json({
        success: false,
        message: "Unable to retrieve note file",
      })
      upstreamResponse.resume()
      return
    }

    res.status(statusCode)

    const contentType = fileType || upstreamResponse.headers["content-type"]
    if (contentType) {
      res.setHeader("Content-Type", contentType)
    }

    const contentLength = upstreamResponse.headers["content-length"]
    if (contentLength) {
      res.setHeader("Content-Length", contentLength)
    }

    res.setHeader(
      "Content-Disposition",
      `${mode === "download" ? "attachment" : "inline"}; filename="${fileName}"`
    )
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Type, Content-Length")
    res.setHeader("Cache-Control", "private, max-age=0, no-store")

    upstreamResponse.pipe(res)
  })

  upstreamRequest.on("error", (error) => {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to stream note file",
        error: error.message,
      })
      return
    }

    res.destroy(error)
  })
}

const hasStudentCourseAccess = async (userId, courseId) => {
  const student = await User.findById(userId)
    .select("courses courseAccess")
    .lean()

  if (!student) {
    return false
  }

  const legacyEnrollment = (student.courses || []).some(
    (enrolledCourseId) => String(enrolledCourseId) === String(courseId)
  )

  const now = new Date()
  const accessRecord = (student.courseAccess || []).find(
    (entry) => String(entry.course) === String(courseId)
  )

  if (accessRecord) {
    return !accessRecord.expiresAt || new Date(accessRecord.expiresAt) > now
  }

  return legacyEnrollment
}

exports.createCourseNote = async (req, res) => {
  try {
    const instructorId = req.user.id
    const {
      courseId,
      title,
      fileUrl,
      filePublicId,
      fileName,
      fileType,
      fileSize,
      resourceType,
    } = req.body

    if (!courseId || !title || !fileUrl || !filePublicId) {
      return res.status(400).json({
        success: false,
        message: "courseId, title, fileUrl and filePublicId are required",
      })
    }

    if (fileType && !ALLOWED_NOTE_TYPES.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Please upload PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX or TXT",
      })
    }

    if (fileSize && Number(fileSize) > MAX_NOTE_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 15MB limit",
      })
    }

    const course = await Course.findById(courseId).select("instructor")

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (String(course.instructor) !== String(instructorId)) {
      return res.status(403).json({
        success: false,
        message: "Only the course instructor can upload notes",
      })
    }

    const newNote = await CourseNote.create({
      course: courseId,
      instructor: instructorId,
      title: title.trim(),
      fileUrl,
      filePublicId,
      fileName: fileName || "note.pdf",
      fileType: fileType || "application/pdf",
      fileSize: Number(fileSize) || 1,
      resourceType: resourceType || "raw",
    })

    const { previewUrl, downloadUrl } = buildAppAssetUrls(req, newNote._id)

    return res.status(201).json({
      success: true,
      message: "Course note uploaded successfully",
      data: {
        ...newNote.toObject(),
        fileUrl: previewUrl,
        previewUrl,
        downloadUrl,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload course note",
      error: error.message,
    })
  }
}

exports.getCourseNotes = async (req, res) => {
  try {
    const userId = req.user.id
    const { courseId } = req.params

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      })
    }

    const course = await Course.findById(courseId).select("instructor")
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const user = await User.findById(userId).select("accountType")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const isOwnerInstructor =
      user.accountType === "Instructor" &&
      String(course.instructor) === String(userId)

    let canAccess = isOwnerInstructor

    if (!canAccess && user.accountType === "Student") {
      canAccess = await hasStudentCourseAccess(userId, courseId)
    }

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view notes for this course",
      })
    }

    const notes = await CourseNote.find({ course: courseId })
      .sort({ createdAt: -1 })
      .select("title fileUrl filePublicId resourceType fileName fileType fileSize createdAt")
      .lean()

    const notesWithSignedUrls = notes.map((note) => {
      const { previewUrl, downloadUrl } = buildAppAssetUrls(req, note._id)

      return {
        ...note,
        fileUrl: previewUrl,
        previewUrl,
        downloadUrl,
      }
    })

    return res.status(200).json({
      success: true,
      data: notesWithSignedUrls,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course notes",
      error: error.message,
    })
  }
}

exports.accessCourseNote = async (req, res) => {
  try {
    const userId = req.user.id
    const { noteId } = req.params
    const mode = req.query.mode === "download" ? "download" : "preview"

    const note = await CourseNote.findById(noteId)
      .select("course filePublicId resourceType fileName fileType fileUrl")
      .lean()

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      })
    }

    const course = await Course.findById(note.course).select("instructor")
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const user = await User.findById(userId).select("accountType")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const isOwnerInstructor =
      user.accountType === "Instructor" &&
      String(course.instructor) === String(userId)

    let canAccess = isOwnerInstructor
    if (!canAccess && user.accountType === "Student") {
      canAccess = await hasStudentCourseAccess(userId, note.course)
    }

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this note",
      })
    }

    const format = getFileExtension(note.fileName, note.fileType)

    // Using secure_url directly since raw resources are publicly accessible URL-wise
    // and proxying it handles the authentication checks for us.
    const fileUrl = note.fileUrl
    return proxyRemoteFile(fileUrl, res, note.fileName || `note.${format}`, note.fileType, mode)
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to access note",
      error: error.message,
    })
  }
}

exports.deleteCourseNote = async (req, res) => {
  try {
    const instructorId = req.user.id
    const { courseId, noteId } = req.body

    if (!courseId || !noteId) {
      return res.status(400).json({
        success: false,
        message: "courseId and noteId are required",
      })
    }

    const course = await Course.findById(courseId).select("instructor")
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (String(course.instructor) !== String(instructorId)) {
      return res.status(403).json({
        success: false,
        message: "Only the course instructor can delete notes",
      })
    }

    const note = await CourseNote.findOne({ _id: noteId, course: courseId })
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found for this course",
      })
    }

    try {
      await cloudinary.uploader.destroy(note.filePublicId, {
        resource_type: "raw",
      })
    } catch {
      // Cloud cleanup failure should not block DB cleanup.
    }

    await CourseNote.findByIdAndDelete(noteId)

    return res.status(200).json({
      success: true,
      message: "Course note deleted successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete course note",
      error: error.message,
    })
  }
}

const mongoose = require("mongoose")

const LiveLecture = require("../models/LiveLecture")
const Course = require("../models/Course")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const User = require("../models/User")
const {
  sendLectureScheduledEmail,
  sendLectureCancelledEmail,
} = require("../utils/emailService")

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// 1) Schedule live lecture (Instructor only)
exports.scheduleLiveLecture = async (req, res) => {
  try {
    const { courseId, title, scheduledAt, sectionName, lectureDescription } = req.body
    const instructorId = req.user.id

    if (!courseId || !title || !scheduledAt || !sectionName) {
      return res.status(400).json({
        success: false,
        message: "courseId, title, sectionName and scheduledAt are required",
      })
    }

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId",
      })
    }

    const course = await Course.findById(courseId).populate("courseContent")
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "You are not the instructor of this course",
      })
    }

    const parsedDate = new Date(scheduledAt)
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduledAt date",
      })
    }

    const normalizedSectionName = sectionName.trim()
    if (!normalizedSectionName) {
      return res.status(400).json({
        success: false,
        message: "sectionName cannot be empty",
      })
    }

    let targetSection = (course.courseContent || []).find(
      (section) => section.sectionName?.toLowerCase() === normalizedSectionName.toLowerCase()
    )

    if (!targetSection) {
      targetSection = await Section.create({
        sectionName: normalizedSectionName,
        subSection: [],
      })

      await Course.findByIdAndUpdate(course._id, {
        $push: { courseContent: targetSection._id },
      })
    }

    const liveSubSection = await SubSection.create({
      title: title.trim(),
      description: (lectureDescription || "Live class session").trim(),
      videoUrl: "",
      addedAt: new Date(),
    })

    await Section.findByIdAndUpdate(targetSection._id, {
      $push: { subSection: liveSubSection._id },
    })

    const lecture = await LiveLecture.create({
      courseId,
      instructorId,
      sectionId: targetSection._id,
      subSectionId: liveSubSection._id,
      title,
      lectureDescription: (lectureDescription || "").trim(),
      scheduledAt: parsedDate,
      status: "scheduled",
    })

    const enrolledStudents = await User.find({
      _id: { $in: course.studentsEnroled || [] },
    }).select("email firstName")

    const lectureDetails = {
      title: lecture.title,
      scheduledAt: lecture.scheduledAt,
      courseTitle: course.courseName,
      roomId: lecture.roomId,
    }

    await Promise.allSettled(
      enrolledStudents
        .filter((student) => student.email)
        .map((student) =>
          sendLectureScheduledEmail(
            student.email,
            student.firstName || "Student",
            lectureDetails
          )
        )
    )

    return res.status(201).json({
      success: true,
      data: lecture,
      message: "Live lecture scheduled successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to schedule live lecture",
      error: error.message,
    })
  }
}

// 2) Get all lectures for a course (Instructor and enrolled students)
exports.getCourseLectures = async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user.id

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId",
      })
    }

    const [course, user] = await Promise.all([
      Course.findById(courseId).select("instructor studentsEnroled"),
      User.findById(userId).select("accountType"),
    ])

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const isCourseInstructor = course.instructor.toString() === userId
    const isEnrolledStudent = course.studentsEnroled.some(
      (studentId) => studentId.toString() === userId
    )

    if (!isCourseInstructor && !isEnrolledStudent) {
      return res.status(403).json({
        success: false,
        message: "Access denied for this course",
      })
    }

    if (isEnrolledStudent && user.accountType !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Only enrolled students can access as student",
      })
    }

    const lectures = await LiveLecture.find({ courseId })
      .populate("sectionId", "sectionName")
      .sort({ scheduledAt: 1 })

    return res.status(200).json({
      success: true,
      data: lectures,
      message: "Live lectures fetched successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch live lectures",
      error: error.message,
    })
  }
}

// 2.1) Get lecture details by roomId (Instructor and enrolled students)
exports.getLectureByRoom = async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user.id

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "roomId is required",
      })
    }

    const lecture = await LiveLecture.findOne({ roomId })
      .populate("sectionId", "sectionName")
      .lean()

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      })
    }

    const [course, user] = await Promise.all([
      Course.findById(lecture.courseId).select("instructor studentsEnroled"),
      User.findById(userId).select("accountType"),
    ])

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        message: "Course or user not found",
      })
    }

    const isCourseInstructor = course.instructor.toString() === userId
    const isEnrolledStudent = course.studentsEnroled.some(
      (studentId) => studentId.toString() === userId
    )

    if (!isCourseInstructor && !isEnrolledStudent) {
      return res.status(403).json({
        success: false,
        message: "Access denied for this room",
      })
    }

    if (isEnrolledStudent && user.accountType !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Only enrolled students can access as student",
      })
    }

    return res.status(200).json({
      success: true,
      data: lecture,
      message: "Lecture fetched successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lecture",
      error: error.message,
    })
  }
}

// 3) Cancel lecture (Only the instructor of that course)
exports.cancelLiveLecture = async (req, res) => {
  try {
    const { lectureId } = req.params
    const instructorId = req.user.id

    if (!isValidObjectId(lectureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lectureId",
      })
    }

    const lecture = await LiveLecture.findById(lectureId)
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      })
    }

    const course = await Course.findById(lecture.courseId).select(
      "instructor studentsEnroled courseName"
    )
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "Only the course instructor can cancel this lecture",
      })
    }

    lecture.status = "cancelled"
    await lecture.save()

    const io = req.app.get("io")
    if (io) {
      io.to(lecture.roomId).emit("lecture-status", {
        lectureId: lecture._id,
        roomId: lecture.roomId,
        status: "cancelled",
      })
      io.to(lecture.roomId).emit("lecture-cancelled", {
        lectureId: lecture._id,
        roomId: lecture.roomId,
      })
    }

    const enrolledStudents = await User.find({
      _id: { $in: course.studentsEnroled || [] },
    }).select("email firstName")

    const lectureDetails = {
      title: lecture.title,
      scheduledAt: lecture.scheduledAt,
      courseTitle: course.courseName,
      roomId: lecture.roomId,
    }

    await Promise.allSettled(
      enrolledStudents
        .filter((student) => student.email)
        .map((student) =>
          sendLectureCancelledEmail(
            student.email,
            student.firstName || "Student",
            lectureDetails
          )
        )
    )

    return res.status(200).json({
      success: true,
      data: lecture,
      message: "Lecture cancelled successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel lecture",
      error: error.message,
    })
  }
}

// 3.1) Upload chat media (Instructor and enrolled students)
exports.uploadChatMedia = async (req, res) => {
  try {
    const userId = req.user.id
    const { roomId, mediaUrl, mediaType } = req.body

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "roomId is required",
      })
    }

    const lecture = await LiveLecture.findOne({ roomId }).lean()
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      })
    }

    const course = await Course.findById(lecture.courseId).select(
      "instructor studentsEnroled"
    )
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const hasAccess =
      course.instructor.toString() === userId ||
      course.studentsEnroled.some((studentId) => studentId.toString() === userId)

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        mediaUrl: mediaUrl || "",
        mediaType: mediaType || "image",
      },
      message: "Chat media processed successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload chat media",
      error: error.message,
    })
  }
}

// 4) Start lecture (Instructor only)
exports.startLiveLecture = async (req, res) => {
  try {
    const { lectureId } = req.params
    const instructorId = req.user.id

    if (!isValidObjectId(lectureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lectureId",
      })
    }

    const lecture = await LiveLecture.findById(lectureId)
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      })
    }

    if (lecture.instructorId.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "Only the lecture instructor can start this lecture",
      })
    }

    lecture.status = "live"
    await lecture.save()

    const io = req.app.get("io")
    if (io) {
      io.to(lecture.roomId).emit("lecture-status", {
        lectureId: lecture._id,
        roomId: lecture.roomId,
        status: "live",
      })
    }

    return res.status(200).json({
      success: true,
      data: lecture,
      message: "Lecture started successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to start lecture",
      error: error.message,
    })
  }
}

// 5) End lecture (Instructor only)
exports.endLiveLecture = async (req, res) => {
  try {
    const { lectureId } = req.params
    const instructorId = req.user.id

    if (!isValidObjectId(lectureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lectureId",
      })
    }

    const lecture = await LiveLecture.findById(lectureId)
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      })
    }

    if (lecture.instructorId.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "Only the lecture instructor can end this lecture",
      })
    }

    lecture.status = "ended"
    await lecture.save()

    const io = req.app.get("io")
    if (io) {
      io.to(lecture.roomId).emit("lecture-status", {
        lectureId: lecture._id,
        roomId: lecture.roomId,
        status: "ended",
      })
      io.to(lecture.roomId).emit("lecture-ended", {
        lectureId: lecture._id,
        roomId: lecture.roomId,
      })
    }

    return res.status(200).json({
      success: true,
      data: lecture,
      message: "Lecture ended successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to end lecture",
      error: error.message,
    })
  }
}

// 6) Upload lecture recording (Instructor only)
exports.uploadLectureRecording = async (req, res) => {
  try {
    const { lectureId } = req.params
    const instructorId = req.user.id
    const { recordingUrl, recordingPath: _recPath } = req.body
    const recordingPath = recordingUrl || _recPath

    if (!isValidObjectId(lectureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lectureId",
      })
    }

    if (!recordingPath) {
      return res.status(400).json({
        success: false,
        message: "Recording URL is required",
      })
    }

    const lecture = await LiveLecture.findById(lectureId)
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      })
    }

    if (lecture.instructorId.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "Only the lecture instructor can upload recording",
      })
    }

    lecture.recordingUrl = recordingPath
    await lecture.save()

    let targetSubSectionId = lecture.subSectionId

    if (targetSubSectionId) {
      const existingSubSection = await SubSection.findById(targetSubSectionId)
      if (!existingSubSection) {
        targetSubSectionId = null
      }
    }

    if (!targetSubSectionId) {
      const fallbackSubSection = await SubSection.create({
        title: lecture.title,
        description: lecture.lectureDescription || "Live class recording",
        videoUrl: recordingPath,
        addedAt: new Date(),
      })

      targetSubSectionId = fallbackSubSection._id

      if (lecture.sectionId) {
        await Section.findByIdAndUpdate(lecture.sectionId, {
          $push: { subSection: targetSubSectionId },
        })
      }

      lecture.subSectionId = targetSubSectionId
      await lecture.save()
    }

    const updatedSubSection = await SubSection.findByIdAndUpdate(
      targetSubSectionId,
      {
        description: lecture.lectureDescription || undefined,
        videoUrl: recordingPath,
        addedAt: new Date(),
      },
      { new: true }
    )

    if (!updatedSubSection) {
      const recreatedSubSection = await SubSection.create({
        title: lecture.title,
        description: lecture.lectureDescription || "Live class recording",
        videoUrl: recordingPath,
        addedAt: new Date(),
      })

      if (lecture.sectionId) {
        await Section.findByIdAndUpdate(lecture.sectionId, {
          $push: { subSection: recreatedSubSection._id },
        })
      }

      lecture.subSectionId = recreatedSubSection._id
      await lecture.save()

      return res.status(200).json({
        success: true,
        recordingUrl: recordingPath,
        data: recreatedSubSection,
        message: "Lecture recording uploaded successfully",
      })
    }

    return res.status(200).json({
      success: true,
      recordingUrl: recordingPath,
      data: updatedSubSection,
      message: "Lecture recording uploaded successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload lecture recording",
      error: error.message,
    })
  }
}

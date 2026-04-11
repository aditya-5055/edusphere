const Course = require("../models/Course.js")
const Category = require("../models/Category.js")
const Section = require("../models/Section.js")
const SubSection = require("../models/Subsection.js")
const LiveLecture = require("../models/LiveLecture")
const User = require("../models/User.js")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const CourseProgress = require("../models/CourseProgress.js")
const { convertSecondsToDuration } = require("../utils/secToDuration")

// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      accessDurationInDays,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body
    const thumbnail = req.files.thumbnailImage

    const tag = JSON.parse(_tag)
    const instructions = JSON.parse(_instructions)

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }
    if (!status) {
      status = "Draft"
    }

    let normalizedAccessDuration = null
    if (
      accessDurationInDays !== undefined &&
      accessDurationInDays !== null &&
      accessDurationInDays !== ""
    ) {
      normalizedAccessDuration = Number(accessDurationInDays)
      if (
        !Number.isInteger(normalizedAccessDuration) ||
        normalizedAccessDuration <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Access duration must be a positive integer in days",
        })
      }
    }

    const instructorDetails = await User.findById(userId)

    if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      })
    }

    const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      })
    }

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    )

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status,
      instructions,
      accessDurationInDays: normalizedAccessDuration,
    })

    await User.findByIdAndUpdate(
      userId,
      {
        $push: { courses: newCourse._id },
      },
      { new: true }
    )

    await Category.findByIdAndUpdate(
      category,
      {
        $push: { courses: newCourse._id },
      },
      { new: true }
    )

    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })
  } catch (error) {
    // console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    })
  }
}
 
exports.editCourse = async (req, res) => {
  try {
   
    const { courseId } = req.body
    const updates = req.body

    // Validate courseId
    if (!courseId) {
      console.log("ERROR: No courseId provided")
      return res.status(400).json({ 
        success: false,
        error: "Course ID is required" 
      })
    }

    // console.log("Looking for course with ID:", courseId)
    const course = await Course.findById(courseId)

    if (!course) {
      console.log("ERROR: Course not found")
      return res.status(404).json({ 
        success: false,
        error: "Course not found" 
      })
    }

    // console.log("Course found:", course.courseName)

    // Handle thumbnail upload only if file is present
    if (req.files && req.files.thumbnailImage) {
      console.log("Uploading thumbnail...")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
      // console.log("Thumbnail uploaded successfully")
    }
 
    const keysToUpdate = Object.keys(updates).filter(key => key !== "courseId")
    
    for (const key of keysToUpdate) {
      console.log(`Updating ${key}:`, updates[key])
      
      if (key === "tag" || key === "instructions") {
        course[key] = JSON.parse(updates[key])
      } else if (key === "accessDurationInDays") {
        if (updates[key] === "" || updates[key] === null) {
          course[key] = null
        } else {
          const parsedDuration = Number(updates[key])
          if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
            return res.status(400).json({
              success: false,
              message: "Access duration must be a positive integer in days",
            })
          }
          course[key] = parsedDuration
        }
      } else {
        course[key] = updates[key]
      }
    }

     await course.save()
 
    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

     res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
 
     
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec()

    return res.status(200).json({
      success: true,
      data: allCourses,
    })
  } catch (error) {
    // console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}

// Get One Single Course Details
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
 

exports.getFullCourseDetails = async (req, res) => {
  try { 
    
    const { courseId } = req.body
    const userId = req.user.id
    
    // Validate courseId
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      })
    }
    
    const requestingUser = await User.findById(userId)
      .select("accountType courseAccess courses")
      .lean()

    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    if (requestingUser.accountType === "Student") {
      const now = new Date()
      const accessEntry = (requestingUser.courseAccess || []).find(
        (entry) => String(entry.course) === String(courseId)
      )
      const hasLegacyEnrollment = (requestingUser.courses || []).some(
        (enrolledCourseId) => String(enrolledCourseId) === String(courseId)
      )

      const hasValidAccess =
        accessEntry
          ? !accessEntry.expiresAt || new Date(accessEntry.expiresAt) > now
          : hasLegacyEnrollment

      if (!accessEntry && hasLegacyEnrollment) {
        await User.findByIdAndUpdate(userId, {
          $push: {
            courseAccess: {
              course: courseId,
              enrolledAt: now,
              expiresAt: null,
            },
          },
        })
      }

      if (!hasValidAccess) {
        await User.findByIdAndUpdate(userId, {
          $pull: {
            courses: courseId,
            courseAccess: { course: courseId },
          },
        })
        await Course.findByIdAndUpdate(courseId, {
          $pull: { studentsEnroled: userId },
        })
        await CourseProgress.deleteOne({ courseID: courseId, userId })

        return res.status(403).json({
          success: false,
          message: "Your access to this course has expired",
        })
      }
    }

    // console.log("Fetching course:", courseId)
    
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()
    
    if (!courseDetails) {
      console.log("Course not found")
      return res.status(404).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }
    
 
    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })
    
    // ✅ FIXED: Safely calculate duration with proper null checks
    let totalDurationInSeconds = 0
    
    if (courseDetails.courseContent && Array.isArray(courseDetails.courseContent)) {
      const subSectionIds = []

      courseDetails.courseContent.forEach((content) => {
        if (content.subSection && Array.isArray(content.subSection)) {
          content.subSection.forEach((subSection) => {
            subSectionIds.push(subSection._id)

            // ✅ FIXED: Only add if timeDuration exists and is valid
            const timeDurationInSeconds = parseInt(subSection.timeDuration)
            if (!isNaN(timeDurationInSeconds)) {
              totalDurationInSeconds += timeDurationInSeconds
            }
          })
        }
      })

      if (subSectionIds.length > 0) {
        const recordedLectures = await LiveLecture.find({
          courseId,
          subSectionId: { $in: subSectionIds },
          recordingUrl: { $exists: true, $ne: null },
        })
          .select("subSectionId recordingUrl")
          .lean()

        const recordingUrlBySubSectionId = new Map(
          recordedLectures.map((lecture) => [
            lecture.subSectionId?.toString(),
            lecture.recordingUrl,
          ])
        )

        courseDetails.courseContent.forEach((content) => {
          if (!content.subSection || !Array.isArray(content.subSection)) return

          content.subSection.forEach((subSection) => {
            if (subSection.videoUrl) return

            const fallbackRecordingUrl = recordingUrlBySubSectionId.get(
              subSection._id?.toString()
            )

            if (fallbackRecordingUrl) {
              subSection.videoUrl = fallbackRecordingUrl
            }
          })
        })
      }
    }
    
    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
    
    // console.log("Sending success response")
    
    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos || [],
      },
    })
  } catch (error) {
    // console.error("=== GET FULL COURSE DETAILS ERROR ===")
    // console.error("Error:", error.message)
    // console.error("Stack:", error.stack)
    // console.error("======================================")
    
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id

    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    // console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
 

exports.deleteCourse = async (req, res) => {
  try {
 
    
    const { courseId } = req.body
    const instructorId = req.user.id

    // Validate courseId
    if (!courseId) {
      console.log("ERROR: No courseId provided")
      return res.status(400).json({ 
        success: false,
        message: "Course ID is required" 
      })
    }
 
    const course = await Course.findById(courseId)
    
    if (!course) {
      console.log("ERROR: Course not found")
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      })
    }

 
    const courseInstructorId = course.instructor._id 
      ? course.instructor._id.toString() 
      : course.instructor.toString()

    if (courseInstructorId !== instructorId.toString()) {
      console.log("ERROR: User is not the instructor")
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this course"
      })
    }

    // console.log("Removing course from enrolled students...")
    const studentsEnrolled = course.studentsEnrolled || []
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

     const courseSections = course.courseContent || []
    for (const sectionId of courseSections) {
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection || []
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }
      await Section.findByIdAndDelete(sectionId)
    }

     await Course.findByIdAndDelete(courseId)

    // console.log("Course deleted successfully")
    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
 
    
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
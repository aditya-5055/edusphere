const express = require("express")
const router = express.Router()

const { auth, isInstructor } = require("../middleware/auth")
const {
  scheduleLiveLecture,
  getCourseLectures,
  getLectureByRoom,
  cancelLiveLecture,
  uploadChatMedia,
  startLiveLecture,
  endLiveLecture,
  uploadLectureRecording,
} = require("../controllers/liveLecture")

// 1) Schedule live lecture (Instructor only)
router.post("/schedule", auth, isInstructor, scheduleLiveLecture)

// 2) Get all lectures for a course (Instructor and enrolled students)
router.get("/course/:courseId", auth, getCourseLectures)

// 2.1) Get lecture details by roomId (Instructor and enrolled students)
router.get("/room/:roomId", auth, getLectureByRoom)

// 3) Cancel lecture (Only the instructor of that course)
router.patch("/:lectureId/cancel", auth, isInstructor, cancelLiveLecture)

// 3.1) Upload chat media (Instructor and enrolled students)
router.post("/chat-media", auth, uploadChatMedia)

// 4) Start lecture (Instructor only)
router.patch("/:lectureId/start", auth, isInstructor, startLiveLecture)

// 5) End lecture (Instructor only)
router.patch("/:lectureId/end", auth, isInstructor, endLiveLecture)

// 6) Upload lecture recording (Instructor only)
router.post(
  "/:lectureId/upload-recording",
  auth,
  isInstructor,
  uploadLectureRecording
)

module.exports = router

const nodemailer = require("nodemailer")
require("dotenv").config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const formatDate = (dateValue) => {
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) {
    return String(dateValue)
  }

  return parsed.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

const sendLectureScheduledEmail = async (studentEmail, studentName, lectureDetails) => {
  const subject = "New Live Class Scheduled - EduSphere"
  const body = `
    <p>Hi ${studentName},</p>
    <p>A new live class has been scheduled for your course.</p>
    <p><strong>Class:</strong> ${lectureDetails.title}</p>
    <p><strong>Course:</strong> ${lectureDetails.courseTitle}</p>
    <p><strong>Scheduled At:</strong> ${formatDate(lectureDetails.scheduledAt)}</p>
    <p>
      <a href="http://yourapp.com/live/${lectureDetails.roomId}" target="_blank" rel="noopener noreferrer">
        Join Class
      </a>
    </p>
    <p>See you in class!</p>
  `

  return transporter.sendMail({
    from: `"EduSphere" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject,
    html: body,
  })
}

const sendLectureCancelledEmail = async (studentEmail, studentName, lectureDetails) => {
  const subject = "Live Class Cancelled - EduSphere"
  const body = `
    <p>Hi ${studentName},</p>
    <p>
      The live class <strong>${lectureDetails.title}</strong> scheduled for
      <strong>${formatDate(lectureDetails.scheduledAt)}</strong> has been cancelled.
    </p>
    <p>Course: <strong>${lectureDetails.courseTitle}</strong></p>
    <p>We will notify you if a new session is scheduled.</p>
  `

  return transporter.sendMail({
    from: `"EduSphere" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject,
    html: body,
  })
}

module.exports = {
  sendLectureScheduledEmail,
  sendLectureCancelledEmail,
}

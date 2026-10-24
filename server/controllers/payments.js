const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const Payment = require("../models/Payment")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

// Helper function to enroll student in courses (shared between verifyPayment and webhook)
const enrollStudentHelper = async (courses, userId) => {
  if (!courses || courses.length === 0 || !userId) {
    throw new Error("Courses array and userId are required for enrollment")
  }

  for (const courseId of courses) {
    const now = new Date()

    // Find the course and add student to studentsEnroled
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $addToSet: { studentsEnroled: userId } },
      { new: true }
    )

    if (!enrolledCourse) {
      console.error(`[Enrollment Helper] Course not found: ${courseId}`)
      continue
    }

    // Initialize or find course progress
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
    }

    // Compute expiry if access duration is configured
    let expiresAt = null
    if (
      enrolledCourse.accessDurationInDays &&
      Number.isInteger(enrolledCourse.accessDurationInDays) &&
      enrolledCourse.accessDurationInDays > 0
    ) {
      expiresAt = new Date(now)
      expiresAt.setDate(expiresAt.getDate() + enrolledCourse.accessDurationInDays)
    }

    // Clear any previous access subdocument for this course
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { courseAccess: { course: courseId } },
      },
      { new: true }
    )

    // Add course, progress, and access window to user
    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          courses: courseId,
          courseProgress: courseProgress._id,
        },
        $push: {
          courseAccess: {
            course: courseId,
            enrolledAt: now,
            expiresAt,
          },
        },
      },
      { new: true }
    )

    if (enrolledStudent && enrolledStudent.email) {
      try {
        await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
          )
        )
      } catch (mailError) {
        console.error("[Enrollment Helper] Could not send enrollment email:", mailError.message)
      }
    }
  }

  return true
}

// 1) Capture Payment / Create Razorpay Order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id

  if (!courses || courses.length === 0) {
    return res.status(400).json({ success: false, message: "Please Provide Course ID" })
  }

  let total_amount = 0

  for (const course_id of courses) {
    let course
    try {
      course = await Course.findById(course_id)

      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Could not find the Course" })
      }

      const uid = new mongoose.Types.ObjectId(userId)

      if (course.studentsEnroled.includes(uid)) {
        return res
          .status(400)
          .json({ success: false, message: "Student is already Enrolled in one or more selected courses" })
      }

      total_amount += course.price
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const receiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: receiptId,
    notes: {
      userId: userId.toString(),
      courses: JSON.stringify(courses),
    },
  }

  try {
    // hwere we create the instance it mean the razorpay give us the order id, payment id, signature, and the signature id 
    const paymentResponse = await instance.orders.create(options)

    // Store Order record in MongoDB for reliable server-side tracking and webhook reconciliation
    await Payment.create({
      orderId: paymentResponse.id,
      userId,
      courses,
      amount: total_amount * 100,
      currency: "INR",
      receipt: receiptId,
      status: "created",
      enrolled: false,
    })

    return res.json({
      success: true,
      data: paymentResponse,
    })
  } catch (error) {
    console.error("[capturePayment] Error initiating order:", error)
    return res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}

// 2) Verify Payment (Immediate Frontend Callback)
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(400).json({ success: false, message: "Payment details missing" })
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    try {
      const paymentRecord = await Payment.findOne({ orderId: razorpay_order_id })

      // Idempotency: If already enrolled (e.g. by Webhook), don't enroll again
      if (paymentRecord && paymentRecord.enrolled) {
        return res.status(200).json({ success: true, message: "Payment Verified (Already Enrolled)" })
      }

      await enrollStudentHelper(courses, userId)

      if (paymentRecord) {
        paymentRecord.status = "captured"
        paymentRecord.paymentId = razorpay_payment_id
        paymentRecord.signature = razorpay_signature
        paymentRecord.enrolled = true
        paymentRecord.enrolledAt = new Date()
        await paymentRecord.save()
      } else {
        await Payment.create({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          userId,
          courses,
          amount: 0,
          status: "captured",
          enrolled: true,
          enrolledAt: new Date(),
        })
      }

      return res.status(200).json({ success: true, message: "Payment Verified" })
    } catch (enrollError) {
      console.error("[verifyPayment] Enrollment error:", enrollError)
      return res.status(500).json({ success: false, message: "Error during enrollment" })
    }
  }

  return res.status(400).json({ success: false, message: "Invalid payment signature" })
}

// 3) Razorpay Webhook Endpoint (Server-to-Server Asynchronous Fulfillment)
exports.razorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"]

  if (!signature) {
     return res.status(400).json({ success: false, message: "Signature header missing" })
  }

  // Use dedicated RAZORPAY_WEBHOOK_SECRET
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!webhookSecret) {
     return res.status(500).json({ success: false, message: "Webhook secret not configured" })
  }

  // Verify HMAC-SHA256 signature using the raw request body
  const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body)

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex")

  if (expectedSignature !== signature) {
    console.warn("[Razorpay Webhook] Rejected: Invalid webhook signature")
    return res.status(400).json({ success: false, message: "Invalid webhook signature" })
  }

  const event = req.body?.event
  const paymentEntity = req.body?.payload?.payment?.entity
  const orderId = paymentEntity?.order_id
  const paymentId = paymentEntity?.id
  const amount = paymentEntity?.amount

 
  try {
    // Event: payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      if (!orderId) {
        console.warn("[Razorpay Webhook] payment.captured received without order_id")
        return res.status(200).json({ status: "ok", message: "No order_id in event payload" })
      }

      const paymentRecord = await Payment.findOne({ orderId })

      if (!paymentRecord) {
        console.warn(`[Razorpay Webhook] No matching Payment record found for orderId: ${orderId}`)
        return res.status(200).json({ status: "ok", message: "Order not found in database" })
      }

      // Log webhook event
      paymentRecord.webhookEvents.push({
        event,
        receivedAt: new Date(),
      })

      // Idempotency: If already enrolled (by /verifyPayment or previous webhook retry), return 200 OK
      if (paymentRecord.enrolled) {
        console.log(`[Razorpay Webhook] Order ${orderId} already enrolled. Skipping duplicate enrollment.`)
        await paymentRecord.save()
        return res.status(200).json({ status: "ok", message: "Already processed" })
      }

      // Execute enrollment using server-side recorded courses and userId
      await enrollStudentHelper(paymentRecord.courses, paymentRecord.userId)

      paymentRecord.status = "captured"
      paymentRecord.paymentId = paymentId || paymentRecord.paymentId
      paymentRecord.enrolled = true
      paymentRecord.enrolledAt = new Date()
      await paymentRecord.save()

      console.log(`[Razorpay Webhook] Successfully enrolled student ${paymentRecord.userId} via Webhook for Order ${orderId}`)

      // Send Payment Success Email if not already sent
      try {
        const student = await User.findById(paymentRecord.userId)
        if (student && student.email) {
          await mailSender(
            student.email,
            "Payment Received",
            paymentSuccessEmail(
              `${student.firstName} ${student.lastName}`,
              (amount || paymentRecord.amount) / 100,
              orderId,
              paymentId
            )
          )
        }
      } catch (emailErr) {
        console.error("[Razorpay Webhook] Error sending payment success email:", emailErr.message)
      }

      return res.status(200).json({ status: "ok", message: "Enrollment completed successfully" })
    }

    // Event: payment.failed
    if (event === "payment.failed") {
      if (orderId) {
        const paymentRecord = await Payment.findOne({ orderId })
        if (paymentRecord) {
          paymentRecord.status = "failed"
          paymentRecord.paymentId = paymentId || paymentRecord.paymentId
          paymentRecord.failureReason = paymentEntity?.error_description || "Payment failed at gateway"
          paymentRecord.webhookEvents.push({
            event,
            receivedAt: new Date(),
          })
          await paymentRecord.save()
          console.log(`[Razorpay Webhook] Payment failed for Order ${orderId}: ${paymentRecord.failureReason}`)
        }
      }
      return res.status(200).json({ status: "ok", message: "Payment failure logged" })
    }

    // Acknowledge other unhandled events
    return res.status(200).json({ status: "ignored", message: `Event ${event} acknowledged` })
  } catch (err) {
    console.error("[Razorpay Webhook] Error processing webhook:", err)
    return res.status(500).json({ success: false, message: "Internal server error processing webhook" })
  }
}

// 4) Send Payment Success Email (Explicit Frontend Request)
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body
  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    if (!enrolledStudent) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )

    return res.status(200).json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("[sendPaymentSuccessEmail] Error sending email:", error)
    return res
      .status(500)
      .json({ success: false, message: "Could not send email" })
  }
}
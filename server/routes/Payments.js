// Import the required modules
const express = require("express")
const router = express.Router()
const {
  capturePayment,
  verifyPayment,
  razorpayWebhook,
  sendPaymentSuccessEmail,
} = require("../controllers/payments")
const { auth, isStudent } = require("../middleware/auth")

// Student-facing payment routes (Protected by JWT and Student role)
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifyPayment", auth, isStudent, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail)

// Razorpay Webhook Endpoint (Server-to-Server, verified via HMAC-SHA256 signature)
router.post("/razorpay-webhook", razorpayWebhook)

module.exports = router

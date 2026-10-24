const express = require("express")
const router = express.Router()

const { generateUploadSignature } = require("../controllers/media")
const { auth } = require("../middleware/auth")

router.post("/generate-signature", auth, generateUploadSignature)

module.exports = router

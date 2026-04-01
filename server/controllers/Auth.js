const bcrypt = require("bcrypt")
const User = require("../models/User")
const OTP=require("../models/Otp")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
require("dotenv").config()

// Signup Controller for Registering USers
exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body

    // 1️⃣ Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // 2️⃣ Password match check
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match",
      })
    }

    // 3️⃣ Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists. Please login.",
      })
    }

    // 4️⃣ Get latest OTP
    const otpRecord = await OTP.findOne({ email })
      .sort({ createdAt: -1 })

    if (!otpRecord || otp !== otpRecord.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      })
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 6️⃣ Approval logic (FIXED ✅)
    const approved = accountType === "Instructor" ? false : true

    // 7️⃣ Create profile
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: contactNumber || null,
    })

    // 8️⃣ Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      approved,
      additionalDetails: profileDetails._id,
         image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        `${firstName} ${lastName}`
      )}`,
    })

    // 9️⃣ Delete OTP after successful signup (IMPORTANT)
    await OTP.deleteMany({ email })

    // 🔟 Remove password from response
    user.password = undefined

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
      error: error.message,
    })
  }
}


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email }).populate("additionalDetails")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not registered. Please signup.",
      })
    }

    // 3️⃣ Check approval (VERY IMPORTANT)
    if (!user.approved) {
      return res.status(403).json({
        success: false,
        message: "Account not approved yet",
      })
    }

    // 4️⃣ Password check
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      })
    }

    // 5️⃣ Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )

    // 6️⃣ Remove sensitive fields
    user.password = undefined

    // 7️⃣ Set cookie (secure way)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    })

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      error: error.message,
    })
  }
}


// Send OTP For Email Verification

exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User is already registered",
      })
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })

    let result = await OTP.findOne({ otp })
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
      result = await OTP.findOne({ otp })
    }

    await OTP.create({ email, otp })

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    })
  } catch (error) {
      console.error("STACK TRACE ↓↓↓");
  console.error(error.stack);
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id
    const { oldPassword, newPassword} = req.body

    // 1️⃣ Validate input
    if (!oldPassword || !newPassword ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // 2️⃣ Check new password match
    // if (newPassword !== confirmNewPassword) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "New password and confirm password do not match",
    //   })
    // }

    // 3️⃣ Fetch user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // 4️⃣ Verify old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      user.password
    )

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      })
    }

    // 5️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 6️⃣ Update password
    user.password = hashedPassword
    await user.save()

    // 7️⃣ Send security email (non-blocking)
    try {
      await mailSender(
        user.email,
        "Password Updated Successfully",
        passwordUpdated(
          user.email,
          `Hi ${user.firstName}, your password has been updated successfully.`
        )
      )
    } catch (emailError) {
      // Email failure should NOT break password change
      console.error("Email failed:", emailError.message)
    }

    // 8️⃣ Success response
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error.message,
    })
  }
}

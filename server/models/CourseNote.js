const mongoose = require("mongoose")

const courseNoteSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["raw", "image", "video", "auto"],
      default: "raw",
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("CourseNote", courseNoteSchema)

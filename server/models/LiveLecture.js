const mongoose = require("mongoose")
const { randomUUID } = require("crypto")

const liveLectureSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      default: null,
    },
    subSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    lectureDescription: {
      type: String,
      default: "",
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      default: "scheduled",
    },
    roomId: {
      type: String,
      unique: true,
      default: () => randomUUID(),
    },
    recordingUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("LiveLecture", liveLectureSchema)

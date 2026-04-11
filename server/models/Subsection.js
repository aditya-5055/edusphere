const mongoose = require("mongoose");

const SubSectionSchema = new mongoose.Schema({
	title: { type: String },
	timeDuration: { type: String },
	description: { type: String },
	videoUrl: { type: String },
	addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SubSection", SubSectionSchema);
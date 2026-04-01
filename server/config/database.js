const mongoose = require("mongoose");
require("dotenv").config();

const { MONGODB_URL } = process.env;

exports.connect = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("DB Connection Success");
  } catch (error) {
    console.error("DB Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

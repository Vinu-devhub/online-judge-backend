const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const MONGO_URL = process.env.MONGO_URL;
  try {
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true });
    console.log("Connection to DB successful");
  } catch (error) {
    console.log("Error connecting to DB: ", error.message);
  }
};

module.exports = {
  connectDB,
};

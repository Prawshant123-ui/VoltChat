const mongoose = require("mongoose");

const connectDB = async (req, res) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database connected!!: ${conn.connection.host}`);
  } catch (error) {
    console.log("Databse not connected!!", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

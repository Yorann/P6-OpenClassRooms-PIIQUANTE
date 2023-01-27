const mongoose = require("mongoose")

mongoose.set('strictQuery', false);

const connectDB = async () => {
    const mongoURL = process.env.MONGO_URL

  try {
    await mongoose.connect(mongoURL);
    console.log("succesfull to connect on database")
  } catch (error) {
    console.log("error to connect on database", error);
  }
}

module.exports = connectDB;

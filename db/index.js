const mongoose = require("mongoose");
const { config } = require('../config');
const connectDataBase = async () => {
  try {
    await mongoose.connect(config.mongo_uri),
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    };
    console.log("MongoDb Connected successfully!");
  } catch (error) {
    console.log("MongoDb Not Connected");
  }
};

module.exports = { connectDataBase };

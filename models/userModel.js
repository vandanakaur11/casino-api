const mongoose = require("mongoose");

const Scheema = mongoose.Schema;

const userScheema = new Scheema(
  {
    firstname: {
      type: String,
      require: true,
      trime: true,
      unique: false,
      lowercase: true,
    },
    lastname: {
      type: String,
      require: true,
      trime: true,
      unique: false,
    },
    phone: {
      type: String
    },
    city: {
      type: String
    },
    address: {
      type: String
    },
    email: {
      type: String,
      require: true,
      trime: true,
      unique: true,
      index: true
    },
    password: {
      type: String,
      require: true,
      trime: true,
      minlength: 6,
    },
    remote_id: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0
    },
    credit: {
      type: Number,
      default: 0
    },
    debit: {
      type: Number,
      default: 0
    },
    code: {
      type: String,
      require: false
    },
    Otpexpiry: {
      type: Date,
      required: false
    },
  },
  { timestamps: true }
);

exports.userModel = mongoose.model("users", userScheema);

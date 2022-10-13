const { userModel } = require("../models/index");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { config } = require('../config');
const randomString = require('randomstring');
const { sendMail } = require('../utils/nodeMailer');




// controller for signup user start
exports.signup = async (req, res) => {
  // get data from request body
  let { firstname, lastname, email, password } = req.body;

  try {
    // check all fields are available for proceed
    if (!firstname || !lastname || !email || !password) {
      return res
        .send({ status: 400, response: "Please provide all required fields" });
    }

    // check user already sign-up with same email
    const user = await userModel.findOne({ email }).exec();
    if (user) {
      return res
        .send({ status: 409, response: "User already exist by this email" });
    }

    // hashing password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    let remote_id = randomString.generate({
      length: 12,
      charset: 'numeric'
    })

    const isAvailable = await userModel.findOne({ remote_id }).exec()
    if (isAvailable) {

      while (isAvailable.remote_id === remote_id) {
        remote_id = randomString.generate({
          length: 12,
          charset: 'numeric'
        });
      }
    }
    // create user
    const createUser = await userModel.create({
      firstname,
      lastname,
      email,
      remote_id,
      password: hashPassword,
    });

    // save document
    createUser.save();

    // response back to frontend that user created with no issue
    return res.send({
      status: 200,
      response: "user was created successfully",
    });

  } catch (error) {
    return res.send({
      status: 500,
      response: `Internal server error:${error.message}`
    })
  }
};

// controller for signup user end


// controller for login start

exports.login = async (req, res) => {

  let { email, password } = req.body;
  console.log(email)
  // check all fields are available or not
  if (!email || !password) {
    return res.send({
      status: 400,
      response: 'Please provide email and password'
    })
  }

  try {
    // check user exist by this email or not
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.send({
        status: 400,
        response: 'User not found!'
      })
    }

    // given password is correct or not
    const isMatch = await bcrypt.compare(password, user.password);


    if (!isMatch) {
      return res.send({
        status: 400,
        response: 'please provide valid password',
      });
    }

    // set payload for jwt
    const payload = {
      email: user.email,
      id: user._id
    };

    // generate token
    const token = jwt.sign(payload, config.jwt_secret, { expiresIn: '365d' });

    // response back token
    return res.status(200).send({
      status: 200,
      response: {
        message: 'User login Sucessfully',
        token,
        email,
        name: user.firstname,
        remote_id: user.remote_id
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
      response: `Internal server error:${error.message}`
    })
  }
}
// controller for login start


// controller for requestOtp start
exports.requestOtp = async (req, res) => {
  let { email } = req.body;
  console.log(email)
  // check all fields are available or not
  if (!email) {
    console.log("run")
    return res.send({
      status: 400,
      response: 'Please provide email'
    });
  }

  try {
    // check user is exsist or not
    const isUser = await userModel.findOne({ email }).exec();

    if (!isUser) {
      return res.send({
        status: 400,
        response: 'User not found by this email',
      });
    }

    // generate otp code 
    const otpCode = randomString.generate(6);

    // save opt code in DB
    const AddOtp = await userModel.findOneAndUpdate({ email }, {

      code: otpCode,
      Otpexpiry: new Date(+new Date() + 300000)

    }, { new: true });

    // sent mail to given user email
    await sendMail(email, otpCode);

    // respone black if all things was gone good
    return res.send({
      status: 200,
      response: "code has been sent to your email"
    })

  } catch (error) {

    return res.status(500).json({
      status: 500,
      response: `Internal server error:${error.message}`
    })
  }

}
// controller for requestOtp end


// controller for verifyOtp start
exports.verifyOtp = async (req, res) => {
  let { Otpcode } = req.body;
  console.log(Otpcode)
  // check code is available or not
  if (!Otpcode) {
    console.log("run")
    return res.send({
      status: 400,
      response: false
    });
  }

  try {
    // check code is correct or not
    const isValid = await userModel.findOne({
      code: Otpcode,
      Otpexpiry: { $gte: new Date() }
    });

    if (!isValid) {
      return res.send({
        status: 400,
        response: false
      });
    }

    // respone black if all things was gone good
    return res.status(200).send({
      status: 200,
      response: true
    })

  } catch (error) {
    return res.status(500).json({
      status: 500,
      response: `Internal server error:${error.message}`
    })
  }
}

// controller verifyotp End


//controller for chang password start

exports.changeUserPassword = async (req, res) => {
  let { password, email } = req.body;
  // check password is avaible or not 
  if (!password) {
    return res.send({
      status: 400,
      response: false
    })
  }

  try {
    // hashing password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    // find user and update his password
    const isUpdate = await userModel.findOneAndUpdate({ email }, { password: hashPassword });

    if (!isUpdate) {
      return res.send({
        status: 400,
        response: false
      })
    }


    // respone black if all things was gone perfect
    return res.send({
      status: 200,
      response: "password change successfully"
    })
  } catch (error) {
    return res.status(500).json({
      status: 500,
      response: `Internal server error:${error.message}`
    })
  }
}

// controller for chang password start


exports.updateUser = async (req, res) => {
  let { firstname, lastname, phone, email, address, city, password, cEmail, remote_id } = req.body;

  if (!firstname || !lastname || !phone || !email || !address || !city || !password || !cEmail || !remote_id) {
    return res.send({
      status: 400,
      response: 'Please provide all require fields'
    })
  }

  try {

    const isUser = await userModel.findOne({ email: cEmail, remote_id });

    if (!isUser) return res.send({
      status: 400,
      response: 'Account not found please login again!'
    })

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    const updateuser = await userModel.findOneAndUpdate({ email: cEmail }, {
      firstname,
      lastname,
      email,
      phone,
      address,
      city,
      password: hashPass
    })

    return res.send({
      status: 200,
      message: 'updated!',
      response: {
        email,
        name: firstname,
        remote_id: remote_id
      }
    })

  } catch (error) {
    return res.json({
      status: 500,
      response: `Internal server error:${error.message}`
    })
  }
}

exports.getUserDetail = async (req, res) => {
  let { remote_id } = req.query;
  
  try {
    const getPlayer = await userModel.findOne({ remote_id: remote_id })
    console.log(getPlayer)
    if (getPlayer) {
      return res.send(
        {
          Error: false,
          res: getPlayer
        }
      )

    }
  } catch (error) {
    console.log(`Error: ${error.message}`)
  }
}
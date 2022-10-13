const express = require("express");
const { signup, login, requestOtp, verifyOtp, changeUserPassword, updateUser, getUserDetail } = require('../controllers/userController')
const app = express();
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/req-otp", requestOtp);

router.post("/verify-otp", verifyOtp);

router.post("/change-password", changeUserPassword);

router.post('/user-update', updateUser)

router.get('/get-player', getUserDetail)

exports.userRoute = app.use("/user", router);

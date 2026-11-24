const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Booking = require("../models/booking.js");
const bookingRouter = require("../router/booking.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/users.js");


//signup route
router.route("/signup")
.get(userController.renderSignUpForm)
.post(wrapAsync(userController.signUp));


//login route
router.route("/login")
.get(userController.logIn)
.post(
     saveRedirectUrl,
     passport.authenticate("local",
    {failureRedirect : "/login", 
    failureFlash : true, 
}),
    userController.loginRenderForm
);

router.get("/logout", userController.logoutRenderForm);

module.exports = router; 
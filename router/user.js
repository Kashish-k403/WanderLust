const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapasync = require("../utils/wrapasync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/users.js");


//signup route
router.route("/signup")
.get(userController.renderSignUpForm)
.post(wrapasync(userController.signUp));


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
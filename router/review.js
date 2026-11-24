const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const { validateReview, isLoggedIn, isAuthor } = require("../middleware.js")

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const bookingRouter = require("../router/booking.js");
const expressError = require("../utils/expressError.js");
const mongoose = require("mongoose");
const { createReview } = require("../controller/reviews.js");
const reviewController = require("../controller/reviews.js");



//reviews
//post
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//review delete
router.delete("/:reviewId",isLoggedIn, isAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;

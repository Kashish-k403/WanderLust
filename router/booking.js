
const express = require("express");
const router = express.Router({ mergeParams: true });

const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");


// Create Booking
router.post("/", isLoggedIn, wrapAsync(async (req, res) => {

    const { checkIn, checkOut, guests } = req.body.booking;
    const { id } = req.params;

    // Find listing
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Prevent owner from booking own listing
    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot book your own listing!");
        return res.redirect(`/listings/${id}`);
    }

    // Validate guests
    const guestCount = Number(guests);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
        req.flash("error", "Please enter a valid number of guests!");
        return res.redirect(`/listings/${id}`);
    }

    // Validate dates
    const startDate = new Date(`${checkIn}T00:00:00.000Z`);
    const endDate = new Date(`${checkOut}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (
        !checkIn ||
        !checkOut ||
        isNaN(startDate.getTime()) ||
        isNaN(endDate.getTime()) ||
        startDate < today ||
        endDate <= startDate
    ) {
        req.flash("error", "Please select valid booking dates!");
        return res.redirect(`/listings/${id}`);
    }

    // Check existing bookings
    const existingBooking = await Booking.findOne({
        listing: id,
        status: "Confirmed",
        checkIn: { $lt: endDate },
        checkOut: { $gt: startDate }
    });

    if (existingBooking) {
        req.flash("error", "These dates are already booked!");
        return res.redirect(`/listings/${id}`);
    }

    // Save booking
    const newBooking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn: startDate,
        checkOut: endDate,
        guests: guestCount
    });

    await newBooking.save();

    req.flash("success", "Your booking has been confirmed!");
    res.redirect(`/listings/${id}`);

}));

module.exports = router;

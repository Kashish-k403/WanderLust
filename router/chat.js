
const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const Conversation = require("../models/conversation.js");
const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Message = require("../models/message.js");
const mongoose = require("mongoose");


// My Chats
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {

    const conversations = await Conversation.find({
        participants: req.user._id
    })
    .populate("participants")
    .populate("listing")
    .sort({ updatedAt: -1 });

    res.render("chats/index.ejs", { conversations });

}));

// Contact Host
router.post("/contact/:listingId", isLoggedIn, wrapAsync(async (req, res) => {

    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Owner cannot contact themselves
    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot contact yourself!");
        return res.redirect(`/listings/${listingId}`);
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
        listing: listingId,
        participants: {
            $all: [req.user._id, listing.owner],
            $size: 2
        }
    });

    // Create new conversation if it doesn't exist
    if (!conversation) {
        conversation = new Conversation({
            listing: listingId,
            participants: [req.user._id, listing.owner]
        });

        await conversation.save();
    }

    res.redirect(`/chats/${conversation._id}`);
}));

// Open Chat
router.get("/:conversationId", isLoggedIn, wrapAsync(async (req, res) => {

    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        req.flash("error", "Conversation not found!");
        return res.redirect("/listings");
    }

    const conversation = await Conversation.findById(conversationId)
        .populate("participants")
        .populate("listing");

    if (!conversation) {
        req.flash("error", "Conversation not found!");
        return res.redirect("/listings");
    }

    const isParticipant = conversation.participants.some(user =>
        user._id.equals(req.user._id)
    );

    if (!isParticipant) {
        req.flash("error", "You are not allowed to access this chat!");
        return res.redirect("/listings");
    }

    const messages = await Message.find({
        conversation: conversationId
    }).populate("sender").sort({ createdAt: 1 });

    res.render("chats/show.ejs", { conversation, messages });
}));

// Send Message
router.post("/:conversationId/messages", isLoggedIn, wrapAsync(async (req, res) => {

    const { conversationId } = req.params;
    const { text } = req.body;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        req.flash("error", "Conversation not found!");
        return res.redirect("/listings");
    }

    // Check whether logged-in user is a participant
    const isParticipant = conversation.participants.some(user =>
        user.equals(req.user._id)
    );

    if (!isParticipant) {
        req.flash("error", "You are not allowed to send messages!");
        return res.redirect("/listings");
    }

    if (!text || !text.trim()) {
        req.flash("error", "Message cannot be empty!");
        return res.redirect(`/chats/${conversationId}`);
    }

    const newMessage = new Message({
        conversation: conversationId,
        sender: req.user._id,
        text: text.trim()
    });

    await newMessage.save();

    res.redirect(`/chats/${conversationId}`);
}));

module.exports = router;

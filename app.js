if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
 console.log("Mapbox token loaded:", !!process.env.MAP_TOKEN);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const listingRouter = require("./router/listing.js");
const reviewRouter = require("./router/review.js");
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash= require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./router/user.js");

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



const atlasUrl = process.env.ATLASDB_URL;


main()
.then(() => {
    console.log("Database connected");
})
.catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect(atlasUrl);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const store = MongoStore.create({
    mongoUrl: atlasUrl,
    crypto : {
        secret: "mysecretcode",
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR ON MONGO  SESSION STORE", err);
})



const sessionOption = {
    store,
    secret: "mysecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student123@gmail.com",
//         username: "studentKinni2",
//     });
//     let registerUser = await User.register(fakeUser, "hellodemo");
//     res.send(registerUser);

// })


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



app.all("/{*splat}", (req, res, next) => {
    next(new expressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
});
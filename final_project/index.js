const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer", // Secret key for the session
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }, // Ensure the session cookie is set correctly
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if user is logged in and has a valid access token
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"];

    // Log the token to verify it's being   fetched
    console.log("Token found:", token);

    // Verify JWT token using the correct secret key
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next(); // Proceed to the next middleware
      } else {
        console.log("JWT Verification Error:", err.message);
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

const PORT = 5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));

const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  // Check if the username exists in the users array
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  // Check if the username and password match a record in the users array
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the username is valid
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  // Check if the username and password match
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Generate JWT token
  const accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 });

  // Save the token in the session
  req.session.authorization = {
    accessToken,
    username,
  };

  // Log the session to confirm token is set
  console.log("Session after login:", req.session);

  return res.status(200).json({ message: "Login successful", accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access token is missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, "access");
    const username = decoded.username;
    const { review } = req.query;
    const { isbn } = req.params;

    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res
      .status(200)
      .json({ message: "Review added/modified successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Assuming Bearer token format
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access token is missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, "access");
    const username = decoded.username;
    const isbn = req.params.isbn;

    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the review exists for the user
    if (books[isbn].reviews[username]) {
      // Delete the user's review
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res
        .status(404)
        .json({ message: "Review not found for this user" });
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

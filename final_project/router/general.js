const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body; // Destructure username and password from the request body

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  // Check if the username already exists
  if (users[username]) {
    return res.status(409).json({ message: "Username already exists." });
  }

  // Register the user
  // Create new user
  const newUser = { username, password };
  users.push(newUser);

  return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    // Send the response with formatted output using JSON.stringify
    return res.status(200).json(JSON.parse(JSON.stringify(books, null, 2)));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    // Get the ISBN from the request parameters
    const isbn = req.params.isbn;

    // Check if the book exists in the books object
    if (books[isbn]) {
      // If the book exists, return its details
      return res.status(200).json(books[isbn]);
    } else {
      // If the book doesn't exist, return a 404 error
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  try {
    // Get the author name from the request parameters
    const author = req.params.author;

    // Create an array to hold books by the specified author
    let booksByAuthor = [];

    // Iterate through the 'books' object to find matches
    for (let key in books) {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        booksByAuthor.push(books[key]); // Add matching books to the array
      }
    }

    // Check if there are books by the specified author
    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res
        .status(404)
        .json({ message: "Books by this author not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  try {
    // Get the title from the request parameters
    const title = req.params.title;

    // Create an array to hold books with the specified title
    let booksByTitle = [];

    // Iterate through the 'books' object to find matches
    for (let key in books) {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        booksByTitle.push(books[key]); // Add matching books to the array
      }
    }

    // Check if there are books with the specified title
    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      return res
        .status(404)
        .json({ message: "Books with this title not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get book review
public_users.get("/review/:isbn", async (req, res) => {
  try {
    // Get the ISBN from the request parameters
    const isbn = req.params.isbn;

    // Check if the book with the given ISBN exists
    if (books[isbn]) {
      // Return the reviews for the book
      return res.status(200).json(books[isbn].reviews);
    } else {
      // If the book doesn't exist, return a 404 error
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports.general = public_users;

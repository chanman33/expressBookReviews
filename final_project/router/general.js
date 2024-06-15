const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const bookList = JSON.stringify(books, null, 4);
        res.status(200).send(bookList);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching the book list", error: error.message });
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const bookDetails = books[isbn];

        if (bookDetails) {
            res.status(200).json(bookDetails);
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching the book details", error: error.message });
    }
});


// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const keys = Object.keys(books); // Obtain all the keys for the 'books' object
        const booksByAuthor = keys.map(key => books[key]) // Iterate through the 'books' array
            .filter(book => book.author === author); // Check if the author matches the one provided in the request parameters

        if (booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor); // Send the matched books as a JSON response
        } else {
            res.status(404).send(`No books found for author: ${author}`);
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching the book details", error: error.message });
    }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const keys = Object.keys(books); // Obtain all the keys for the 'books' object
        const booksByTitle = keys.map(key => books[key]) // Iterate through the 'books' array
            .filter(book => book.title === title); // Check if the title matches the one provided in the request parameters

        if (booksByTitle.length > 0) {
            res.status(200).json(booksByTitle); // Send the matched books as a JSON response
        } else {
            res.status(404).send(`No books found for title: ${title}`);
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching the book details", error: error.message });
    }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn]; // Find the book by its ISBN

    if (book) { // Check if the book exists
        res.json(book.reviews); // Send the reviews of the book as a JSON response
    } else {
        res.status(404).json({ message: "Book not found" }); // Send an error message if the book is not found
    }
});

module.exports.general = public_users;

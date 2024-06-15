const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const session = require('express-session');

let users = [];

const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    return userswithsamename.length > 0;
}

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    return validusers.length > 0;
}



// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: username
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization.username;

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    // Ensure books[isbn] exists and has a reviews array
    if (books[isbn]) {
        if (!Array.isArray(books[isbn].reviews)) {
            books[isbn].reviews = []; // Initialize reviews as an empty array if it doesn't exist
        }
        books[isbn].reviews.push({ username, review });
        return res.status(200).json({ message: "Review added successfully" });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    // Check if the book exists
    if (books[isbn]) {
        const reviews = books[isbn].reviews;

        if (!Array.isArray(reviews)) {
            return res.status(400).json({ message: "No reviews found for this book" });
        }

        // Filter out the reviews that do not belong to the current user
        const filteredReviews = reviews.filter(review => review.username !== username);

        // If no reviews were deleted, it means the user didn't have a review for this book
        if (filteredReviews.length === reviews.length) {
            return res.status(404).json({ message: "Review not found or you do not have permission to delete this review" });
        }

        // Update the reviews for the book
        books[isbn].reviews = filteredReviews;

        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;


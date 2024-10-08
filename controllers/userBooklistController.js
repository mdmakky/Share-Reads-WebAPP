const Book = require("../models/userBooklist");
const multer = require('multer');
const path = require('path');
const User = require("../models/user");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
});
  
const upload = multer({ storage: storage });

exports.getBooks = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const books = await Book.find({ userId: req.user._id });
            const user = await User.findById(req.user._id)
            const unreadCount = user.notifications.filter(notification => notification.unread).length;
            res.render("booklist", { books, unreadCount: unreadCount });
        } catch (err) {
            console.log(err);
            res.redirect("/");
        }
    } else {
        res.redirect("/");
    }
};

exports.addBook = [
    upload.single('bookImage'),
    async (req, res) => {
        if (req.isAuthenticated()) {
            try {
                const bookImage = req.file ? `/uploads/${req.file.filename}` : undefined;

                const newBook = new Book({
                    userId: req.user._id,
                    title: req.body.title,
                    author: req.body.author,
                    review: req.body.review,
                    rating: req.body.rating,
                    bookImage: bookImage
                });

                await newBook.save();
                res.redirect("/booklist");
            } catch (err) {
                console.log(err);
                res.redirect("/booklist");
            }
        } else {
            res.redirect("/");
        }
    }
];

exports.deleteBook = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const bookId = req.body.bookId;
            if (!bookId) {
                console.log("No book ID provided");
                return res.redirect("/booklist");
            }

            await Book.deleteOne({ _id: bookId, userId: req.user._id });
            res.redirect("/booklist");
        } catch (err) {
            console.log(err);
            res.redirect("/booklist");
        }
    } else {
        res.redirect("/");
    }
};
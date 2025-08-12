const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
const { books } = require("./booksdb.js");

const app = express();
const PORT = 5000;

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"];
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Get all books
app.get("/books", async (req, res) => {
  try {
    let getBooks = new Promise((resolve) => {
      setTimeout(() => resolve(books), 100);
    });
    let allBooks = await getBooks;
    res.json(allBooks);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get book by ID
app.get("/books/:id", (req, res) => {
  const id = req.params.id;
  if (books[id]) {
    res.json(books[id]);
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

// Get books by author
app.get("/books/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const results = Object.values(books).filter((book) =>
    book.author.toLowerCase().includes(author)
  );
  results.length
    ? res.json(results)
    : res.status(404).json({ error: "No books found for this author" });
});

// Get books by title
app.get("/books/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const results = Object.values(books).filter((book) =>
    book.title.toLowerCase().includes(title)
  );
  results.length
    ? res.json(results)
    : res.status(404).json({ error: "No books found for this title" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Search by ISBN (numeric id)
app.get("/books/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

// Search by Author
app.get("/books/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const results = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author
  );
  if (results.length > 0) {
    res.json(results);
  } else {
    res.status(404).json({ error: "No books found for this author" });
  }
});

// Search by Title
app.get("/books/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const results = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title
  );
  if (results.length > 0) {
    res.json(results);
  } else {
    res.status(404).json({ error: "No books found with this title" });
  }
});

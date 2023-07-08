const express = require("express");
const connectToDb = require("./config/connectToDb");
const { notFund, errorHandler } = require("./middlewares/Error");
require("dotenv").config();

// connect to the database
connectToDb();

//Init App
const app = express();

// middleware
app.use(express.json());

// Route
app.use("/api/auth", require("./routes/authroute"));
app.use("/api/users", require("./routes/userroute"));
app.use("/api/posts", require("./routes/postsroute"));
app.use("/api/comments", require("./routes/commentroute"));
app.use("/api/categorys", require("./routes/categoryroute"));

// Error handlers
 app.use(notFund);
 app.use(errorHandler);

// running the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} port ${PORT}`)
);

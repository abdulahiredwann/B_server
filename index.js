require("dotenv").config();
const cors = require("cors");
const express = require("express");
const post = require("./routes/Post");
const user = require("./routes/User");
const login = require("./routes/Login");
const register = require("./routes/Register");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const bodyParser = require("body-parser");

app.use(cors()); // This will allow all origins

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// API
app.use("/api/user", user);
app.use("/register", register);
app.use("/api/post", post);
app.use("/login", login);

const db = process.env.MONGODB_URI;
mongoose
  .connect(db)
  .then(() => {
    console.log(`Connected to db...`);
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB...", err);
  });
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

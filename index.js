const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/users.js");
const { connectDB } = require("./db/db.js");
const cookieParser = require("cookie-parser");

const app = express();

const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/signup", async (req, res) => {
  try {
    console.log(req.body);

    // get the data from frontend
    const { firstName, lastName, email, password } = req.body;

    // check that all data is provided
    if (!(firstName && lastName && email && password)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create a new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // generate the token for the user and send it back

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    user.token = token;
    user.password = undefined;

    res.status(200).json({
      message: "You have successfully registered!",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    //get the user info
    const { email, password } = req.body;

    // check that all data exist in user info
    if (!(email && password)) {
      return res.status(400).send("All fields are required");
    }

    // find the user in db
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User not found!");
    }

    // match the password
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).send("Password does not match!");
    }

    // generate the token for the user and send it back
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    user.token = token;
    user.password = undefined;

    // store cookies
    const options = {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    // send token
    res.status(200).cookie("token", token, options).json({
      message: "You have successfully signed in!",
      success: true,
      token,
    });
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// TEMP DB (later we use real database)
let users = [];

// Home
app.get("/", (req, res) => {
  res.send("ReplyAstra API is running 🚀");
});

// REGISTER
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  let userExists = users.find(u => u.email === email);
  if (userExists)
    return res.status(400).json({ msg: "User already exists" });

  const hashedPass = await bcrypt.hash(password, 10);

  users.push({ email, password: hashedPass });

  res.json({ msg: "Registration successful" });
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  let user = users.find(u => u.email === email);
  if (!user)
    return res.status(400).json({ msg: "User not found" });

  let match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(400).json({ msg: "Wrong password" });

  const token = jwt.sign(
    { email },
    "replyastra_secret",
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// PROTECTED DASHBOARD
app.get("/api/dashboard", (req, res) => {
  const token = req.headers.authorization;

  if (!token)
    return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, "replyastra_secret");
    res.json({ msg: "Welcome " + decoded.email });
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
});

// OLD DM API
app.post("/api/dm", (req, res) => {
  const { message } = req.body;
  let reply = "Sorry, I didn't understand";

  if (message.toLowerCase().includes("hello"))
    reply = "Hi 👋 Welcome to ReplyAstra!";

  res.json({ bot_reply: reply });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// TEMP DB
let users = [];

// HOME
app.get("/", (req, res) => {
  res.send("ReplyAstra API 🚀");
});


// ================= AUTH =================

// REGISTER
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "All fields required" });

  const existing = users.find(u => u.email === email);
  if (existing)
    return res.status(400).json({ msg: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);

  users.push({ email, password: hashed });

  res.json({ msg: "User registered successfully" });
});


// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user)
    return res.status(400).json({ msg: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(400).json({ msg: "Wrong password" });

  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET || "replyastra_secret",
    { expiresIn: "1d" }
  );

  res.json({ token });
});


// AUTH MIDDLEWARE
function auth(req, res, next) {
  const token = req.header("Authorization");

  if (!token)
    return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET || "replyastra_secret"
    );
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
}


// DASHBOARD
app.get("/api/dashboard", auth, (req, res) => {
  res.json({
    msg: "Welcome to ReplyAstra Dashboard 🚀",
    user: req.user.email
  });
});


// ================= INSTAGRAM =================

// TEST TOKEN API  (ADD HERE 👈)
app.get("/api/instagram/test", async (req, res) => {
  try {
    const token = process.env.IG_TOKEN;
    const userId = process.env.IG_USER_ID;

    const url =
      `https://graph.facebook.com/v18.0/${userId}?fields=username&access_token=${token}`;

    const response = await axios.get(url);

    res.json(response.data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const axios = require("axios");

app.get("/api/instagram/test", async (req, res) => {
  try {
    const url =
      `https://graph.facebook.com/v18.0/${process.env.IG_USER_ID}` +
      `?fields=username&access_token=${process.env.IG_TOKEN}`;

    const response = await axios.get(url);

    res.json(response.data);

  } catch (err) {
    res.status(400).json(err.response?.data || err.message);
  }
});

// ================= START =================

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});

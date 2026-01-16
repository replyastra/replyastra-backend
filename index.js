require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Home
app.get("/", (req, res) => {
  res.send("ReplyAstra API with Database 🚀");
});

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userCheck.rows.length > 0)
      return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users(email,password) VALUES($1,$2)",
      [email, hashed]
    );

    res.json({ msg: "Registration successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ msg: "User not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign(
      { email },
      "replyastra_secret",
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DASHBOARD
app.get("/api/dashboard", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ msg: "No token" });

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

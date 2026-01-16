const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// Fake DB (temporary - later we connect Supabase)
let users = [];

// Home route
app.get("/", (req, res) => {
  res.send("ReplyAstra API with Database 🚀");
});

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

// LOGIN API
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: "User not found" });
    }

    const valid = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!valid) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

  const token = jwt.sign({ email }, "secret123");

  res.json({ token });
});

// DASHBOARD
app.get("/api/dashboard", (req, res) => {
  res.json({ msg: "Welcome to dashboard 🎉" });
});

// Start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});

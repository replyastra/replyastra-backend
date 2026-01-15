require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("ReplyAstra API is running 🚀");
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message: "Backend working perfectly"
  });
});

// Auto reply logic (sample)
app.post("/api/dm", (req, res) => {
  const { message } = req.body;

  let reply = "Sorry, I didn't understand";

  if (message.toLowerCase().includes("price")) {
    reply = "Please check our pricing here: replyastra.online/pricing";
  }

  if (message.toLowerCase().includes("hello")) {
    reply = "Hi 👋 Welcome to ReplyAstra!";
  }

  if (message.toLowerCase().includes("demo")) {
    reply = "Book free demo here: replyastra.online/demo";
  }

  res.json({
    user_message: message,
    bot_reply: reply
  });
});

// Server start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

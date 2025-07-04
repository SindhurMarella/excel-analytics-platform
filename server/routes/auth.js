// routes/auth.js
const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, isAdmin } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10); // Fixed bcryptjs usage

    // Create user with hashed password
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      isAdmin 
    });
    
    await user.save();
    res.status(201).json({ message: "User registered" });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "User already exists" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: Object.values(err.errors).map(e => e.message).join(", "),
      });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcryptjs.compare(password, user.password); // Ensure bcryptjs here too
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

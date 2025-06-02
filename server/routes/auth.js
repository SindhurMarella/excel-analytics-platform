const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Register
router.post('/register', async(req,res) => {
    const {name, email, password, isAdmin } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 10);
    try{
        const user = new User({ name, email, password:
            hashedPassword, isAdmin });
        await user.save();
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(400).json({error: err.message });
    }
});


//Login
router.post('/login', async(req,res) => {
    const {email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ error: "Invalid credentials" });
    const isMatch = await bcyprt.compare(password, user.password);
    if(!isMatch) return res.status(401).json({error: "Invalid credentials" });
    
    const token = jwt.sign({userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

module.exports = router;
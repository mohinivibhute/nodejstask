const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
var User = require('../userManagement/userModel')
var authenticateToken=require("../middleware/auth.js")

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create a new user
    const newUser = new User({
      username,
      email,
      password, // Assuming the password is already hashed before saving
    });
    // Save the user to the database
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login and get a token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
   
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
    res.status(200).json({message:"Login Successfull" ,status:true,token });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization; // Assuming token is provided in the request header
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }
    const decodedToken = jwt.verify(token, 'your_secret_key');
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const userId = decodedToken.userId;
    if (userId !== req.params.id) {
      return res.status(403).json({ message: 'Unauthorized access to user data' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


module.exports = router;

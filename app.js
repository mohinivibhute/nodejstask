// app.js
const express = require('express');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
var userAPI = require('./routes/userManagement/userController');
var orderAPI=require('./routes/orderManagement/orderController')
var productAPI=require('./routes/productManagement/productController')

const path = require('path');
var app = express();






mongoose.connect('mongodb://127.0.0.1:27017/myapp', {
     
     })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Middleware
app.use(express.json());
app.use("/uploads", express.static('uploads'));

// Routes
app.use('/', userAPI);
app.use('/',orderAPI);
app.use('/',productAPI);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

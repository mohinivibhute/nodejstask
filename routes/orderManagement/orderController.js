const express = require('express');
const router = express.Router();
const Order = require('../orderManagement/orderModel');
//var authenticateToken=require("../middleware/auth.js")


router.post('/orders', async (req, res) => {
    try {
        const { userId, products, totalPrice } = req.body;
        const order = new Order({ userId, products, totalPrice });
        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Get orders for logged-in user
router.get('/allOrders', async (req, res) => {
    try {
        const userId = req.user.userId; // Get the userId from the decoded token
        
        // Fetch orders for the logged-in user
        const orders = await Order.find({ userId });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
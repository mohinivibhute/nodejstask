const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const Product = require('../productManagement/productModel');

// Define the destination path for file uploads
const destinationPath = path.join(".", "uploads");

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(destinationPath)) {
  fs.mkdirSync(destinationPath, { recursive: true });
}

// Define multer storage with fixed destination
const storage = multer.diskStorage({
  destination: destinationPath,
  filename: function (req, file, cb) {
    // Generate a unique filename using current timestamp and original filename
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create multer instance with fixed storage
const upload = multer({ storage });

// Middleware to handle file uploads
const productUploadMiddleware = upload.fields([
  { name: "name" },
  { name: "description" },
  { name: "imageUrl" },
  { name: "price" },
  { name: "quantity" },
]);

// Route to add a new product
router.post('/addProduct', async (req, res) => {
  try {
    // Handle file upload middleware for products
    productUploadMiddleware(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "File upload failed" });
      }

      // Extract uploaded image path from the request
      let imageUrl = null;
      if (req.files["imageUrl"]) {
        imageUrl = req.files["imageUrl"][0].path.replace(/\\/g, "/");
      }

      // Extract product details from the request body
      const { name, description, price, quantity } = req.body;

      // Create a new product instance
      const product = new Product({
        name,
        description,
        imageUrl, // Use the uploaded file path as the imageUrl
        price,
        quantity,
      });

      // Save the product to the database
      const savedProduct = await product.save();

      res.status(200).json({ message: "Product added successfully", status: true, savedProduct });
    });
  } catch (error) {
    console.error("Error while adding product", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/allProducts', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /products/:id - Update product by ID (Protected route)
router.put('/updateProduct', productUploadMiddleware, async (req, res) => {
  const id = req.query.id;
  const newData = req.body;

  try {
      // Check if the product exists
      const product = await Product.findById(id);
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }

      // Delete existing images if product.imageUrl is an array
      if (Array.isArray(product.imageUrl) && product.imageUrl.length > 0) {
          // Delete old images from uploads directory
          product.imageUrl.forEach((imagePath) => {
              fs.unlinkSync(imagePath);
          });
      }

      // Update product data including images if provided
      const updateData = { ...newData };
      if (req.files && req.files["images"]) {
          const imageUrl = req.files["images"].map((file) => file.path.replace(/\\/g, "/"));
          updateData.imageUrl = imageUrl;
      }

      // Update product
      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

      res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
      console.error("Error occurred while updating product:", error);
      res.status(500).json({ message: "Error occurred while updating product", error: error.message });
  }
});


router.delete('/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated images if product has imageUrl array
    if (Array.isArray(deletedProduct.imageUrl) && deletedProduct.imageUrl.length > 0) {
      deletedProduct.imageUrl.forEach((imagePath) => {
        fs.unlinkSync(imagePath);
      });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

 module.exports = router;

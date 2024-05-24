const jwt = require('jsonwebtoken');
var User = require('../userManagement/userModel')
// Function to generate access token






const authenticateToken = async (req, res, next) => {
    const token = req.header('Authorization');
  
    if (!token) return res.status(401).json({ error: 'Access Denied' });
  
    try {
      const verified = jwt.verify(token, process.env.SECRET_KEY);
      req.user = verified;
      next();
    } catch (err) {
      res.status(400).json({ error: 'Invalid Token' });
    }
  };
  

module.exports =   authenticateToken ;

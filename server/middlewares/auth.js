// middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Function to generate JWT token
console.log("came middle")
const generateToken = (userId) => {
  const secret =  'your_jwt_secret'; // Use environment variable for secret
  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
};

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable for secret
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId; // Assuming the token contains the user ID as 'userId'
    
    // Fetch the user from the database
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    req.user = user; // Attach user to the request object
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};
module.exports = { generateToken, verifyToken };
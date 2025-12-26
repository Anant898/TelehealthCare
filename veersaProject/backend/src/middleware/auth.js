const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authorization format. Use Bearer token' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired. Please login again' });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token. Please login again' });
      }
      throw jwtError;
    }

    // Determine user type based on role in token
    const role = decoded.role || 'patient';
    let user = null;

    if (role === 'doctor') {
      user = await Doctor.findById(decoded.id).select('-password');
    } else if (role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
    } else {
      user = await Patient.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists. Please register again' });
    }

    // Attach user info to request
    req.user = user;
    req.userId = user._id;
    req.userRole = role;
    
    // Also attach to specific role property for backwards compatibility
    if (role === 'patient') {
      req.patient = user;
    } else if (role === 'doctor') {
      req.doctor = user;
    } else if (role === 'admin') {
      req.admin = user;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error. Please try again' });
  }
};

module.exports = authMiddleware;


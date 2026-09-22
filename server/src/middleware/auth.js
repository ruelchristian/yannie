const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'icct_lost_and_found_secret_key_2026';

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        studentId: true,
        fullName: true,
        role: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found or expired.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required.' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          studentId: true,
          fullName: true,
          role: true,
          phoneNumber: true,
        },
      });
      if (user) req.user = user;
    }
  } catch (e) {
    // ignore token errors for optional auth
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth,
  JWT_SECRET,
};

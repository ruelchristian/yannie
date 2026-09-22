const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const register = async (req, res) => {
  try {
    const { email, studentId, fullName, phoneNumber, password, role } = req.body;

    if (!email || !studentId || !fullName || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, student ID, full name, and password.',
      });
    }

    // Check if email or studentId already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { studentId }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }
      return res.status(400).json({ success: false, message: 'An account with this Student/Employee ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'STAFF' ? 'STAFF' : 'STUDENT';

    const user = await prisma.user.create({
      data: {
        email,
        studentId,
        fullName,
        phoneNumber: phoneNumber || null,
        password: hashedPassword,
        role: assignedRole,
      },
      select: {
        id: true,
        email: true,
        studentId: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim() },
          { studentId: email.trim() }
        ]
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email/ID and password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email/ID and password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      studentId: user.studentId,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        studentId: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            reports: true,
            claims: true,
          },
        },
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
};

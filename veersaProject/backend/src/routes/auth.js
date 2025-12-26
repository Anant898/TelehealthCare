const express = require('express');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const { encryptPHIMiddleware } = require('../middleware/encryption');
const router = express.Router();

// Register new patient
router.post('/register', encryptPHIMiddleware, async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, medicalHistory, password, specialty } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!dateOfBirth) {
      return res.status(400).json({ error: 'Date of birth is required' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email: email.toLowerCase() });
    if (existingPatient) {
      return res.status(400).json({ error: 'Patient already exists with this email' });
    }

    // Create new patient
    const patient = new Patient({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      dateOfBirth,
      medicalHistory: medicalHistory || '',
      password,
      encryptedPHI: req.body.encryptedPHI
    });

    await patient.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: patient._id, email: patient.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login patient
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Find patient
    const patient = await Patient.findOne({ email: email.toLowerCase().trim() });
    if (!patient) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: patient._id, email: patient.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;


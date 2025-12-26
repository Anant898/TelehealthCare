const express = require('express');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Doctor Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, specialty, password, licenseNumber, experience } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!specialty || !specialty.trim()) {
      return res.status(400).json({ error: 'Specialty is required' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      return res.status(400).json({ error: 'Doctor already exists with this email' });
    }

    // Create new doctor
    const doctor = new Doctor({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      specialty: specialty.trim(),
      password,
      licenseNumber: licenseNumber || '',
      experience: experience || 0,
      isAvailable: true
    });

    await doctor.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: doctor._id, email: doctor.email, role: 'doctor' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        role: 'doctor'
      }
    });
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Doctor Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const doctor = await Doctor.findOne({ email: email.toLowerCase().trim() });
    if (!doctor) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: doctor._id, email: doctor.email, role: 'doctor' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        role: 'doctor'
      }
    });
  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get doctor profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.userId).select('-password');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ error: 'Failed to fetch doctor profile' });
  }
});

// Get doctor's consultations
router.get('/consultations', authMiddleware, async (req, res) => {
  try {
    const consultations = await Consultation.find({ doctor: req.userId })
      .populate('patient', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(consultations);
  } catch (error) {
    console.error('Get doctor consultations error:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// Get pending consultations (not assigned to any doctor)
router.get('/consultations/pending', authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.userId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Find consultations that match doctor's specialty and have no doctor assigned
    const pendingConsultations = await Consultation.find({
      doctor: null,
      specialty: doctor.specialty,
      status: { $in: ['scheduled', 'pending'] }
    })
      .populate('patient', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(pendingConsultations);
  } catch (error) {
    console.error('Get pending consultations error:', error);
    res.status(500).json({ error: 'Failed to fetch pending consultations' });
  }
});

// Accept a consultation
router.post('/consultations/:id/accept', authMiddleware, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    if (consultation.doctor) {
      return res.status(400).json({ error: 'Consultation already assigned to a doctor' });
    }

    const doctor = await Doctor.findById(req.userId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (consultation.specialty !== doctor.specialty) {
      return res.status(400).json({ error: 'Consultation specialty does not match your specialty' });
    }

    consultation.doctor = req.userId;
    consultation.status = 'accepted';
    await consultation.save();

    doctor.consultations.push(consultation._id);
    await doctor.save();

    res.json({ 
      message: 'Consultation accepted successfully',
      consultation 
    });
  } catch (error) {
    console.error('Accept consultation error:', error);
    res.status(500).json({ error: 'Failed to accept consultation' });
  }
});

// Update availability status
router.patch('/availability', authMiddleware, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    const doctor = await Doctor.findById(req.userId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    doctor.isAvailable = isAvailable;
    await doctor.save();

    res.json({ 
      message: 'Availability updated successfully',
      isAvailable: doctor.isAvailable
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Get doctor statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalConsultations = await Consultation.countDocuments({ doctor: req.userId });
    const completedConsultations = await Consultation.countDocuments({ 
      doctor: req.userId, 
      status: 'completed' 
    });
    const activeConsultations = await Consultation.countDocuments({ 
      doctor: req.userId, 
      status: { $in: ['accepted', 'in-progress'] }
    });

    const doctor = await Doctor.findById(req.userId);
    const pendingCount = await Consultation.countDocuments({
      doctor: null,
      specialty: doctor.specialty,
      status: { $in: ['scheduled', 'pending'] }
    });

    res.json({
      total: totalConsultations,
      completed: completedConsultations,
      active: activeConsultations,
      pending: pendingCount
    });
  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;


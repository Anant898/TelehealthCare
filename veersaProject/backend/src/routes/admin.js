const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Admin Login (no registration endpoint for security)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get admin profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId).select('-password');
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
});

// Get dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalConsultations = await Consultation.countDocuments();
    const activeConsultations = await Consultation.countDocuments({ 
      status: { $in: ['scheduled', 'accepted', 'in-progress'] }
    });
    const completedConsultations = await Consultation.countDocuments({ status: 'completed' });
    const pendingConsultations = await Consultation.countDocuments({ 
      doctor: null,
      status: { $in: ['scheduled', 'pending'] }
    });

    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({ status: 'completed' });
    
    // Calculate total revenue
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get recent activity
    const recentPatients = await Patient.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentConsultations = await Consultation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialty');

    // Specialty distribution
    const specialtyStats = await Consultation.aggregate([
      { $group: { _id: '$specialty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: {
        totalPatients,
        totalDoctors,
        totalConsultations,
        activeConsultations,
        completedConsultations,
        pendingConsultations,
        totalPayments,
        successfulPayments,
        totalRevenue
      },
      recentActivity: {
        patients: recentPatients,
        consultations: recentConsultations
      },
      specialtyStats
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all patients
router.get('/patients', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const patients = await Patient.find()
      .select('-password -encryptedPHI')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Patient.countDocuments();

    res.json({
      patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get all doctors
router.get('/doctors', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const doctors = await Doctor.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Doctor.countDocuments();

    res.json({
      doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get all consultations
router.get('/consultations', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const consultations = await Consultation.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name specialty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Consultation.countDocuments();

    res.json({
      consultations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// Get all payments
router.get('/payments', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const payments = await Payment.find()
      .populate('patient', 'name email')
      .populate('consultation', 'specialty status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments();

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Delete patient (soft delete or hard delete based on requirements)
router.delete('/patients/:id', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// Delete doctor
router.delete('/doctors/:id', authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

module.exports = router;


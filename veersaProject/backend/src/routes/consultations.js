const express = require('express');
const authMiddleware = require('../middleware/auth');
const Consultation = require('../models/Consultation');
const DailyService = require('../services/dailyService');
const router = express.Router();

// Create new consultation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { specialty, startTime } = req.body;

    // Validate required fields
    if (!specialty) {
      return res.status(400).json({ error: 'Specialty is required' });
    }
    if (!startTime) {
      return res.status(400).json({ error: 'Start time is required' });
    }

    // Validate startTime is a valid date
    const startTimeDate = new Date(startTime);
    if (isNaN(startTimeDate.getTime())) {
      return res.status(400).json({ error: 'Invalid start time format' });
    }

    // Check if DAILY_API_KEY is configured
    if (!process.env.DAILY_API_KEY) {
      console.error('DAILY_API_KEY is not configured');
      return res.status(500).json({ error: 'Daily.co API key is not configured. Please set DAILY_API_KEY in your environment variables.' });
    }

    // Create Daily.co room
    const dailyRoom = await DailyService.createRoom({
      properties: {
        exp: Math.floor(startTimeDate.getTime() / 1000) + (60 * 60 * 24) // 24 hours from start time
      }
    });

    if (!dailyRoom || !dailyRoom.name || !dailyRoom.url) {
      console.error('Invalid Daily.co room response:', dailyRoom);
      return res.status(500).json({ error: 'Failed to create Daily.co room: Invalid response' });
    }

    // Create consultation record
    const consultation = new Consultation({
      patient: req.userId,
      specialty,
      dailyRoomId: dailyRoom.name,
      dailyRoomUrl: dailyRoom.url,
      startTime: startTimeDate,
      status: 'scheduled'
    });

    await consultation.save();

    // Generate token for patient
    const token = await DailyService.createToken(dailyRoom.name, req.userId.toString(), {
      isOwner: true
    });

    res.status(201).json({
      consultation,
      roomUrl: dailyRoom.url,
      token
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    if (error.message && error.message.includes('Daily.co')) {
      return res.status(500).json({ 
        error: error.message,
        hint: 'Please check your DAILY_API_KEY environment variable and ensure it is valid.'
      });
    }

    res.status(500).json({ 
      error: 'Failed to create consultation',
      message: error.message || 'Unknown error occurred'
    });
  }
});

// Get patient's consultations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const consultations = await Consultation.find({ patient: req.userId })
      .sort({ createdAt: -1 })
      .populate('payment', 'status amount');

    res.json(consultations);
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// Get specific consultation
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // First, find the consultation without role filter
    const consultation = await Consultation.findById(req.params.id)
      .populate('payment')
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialty');

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Validate access based on user role
    if (req.userRole === 'doctor') {
      // Doctors can only access consultations they own OR consultations they can accept
      const isOwner = consultation.doctor && consultation.doctor._id.toString() === req.userId.toString();
      if (!isOwner) {
        return res.status(403).json({ error: 'You do not have access to this consultation' });
      }
    } else if (req.userRole === 'patient') {
      // Patients can only access their own consultations
      if (consultation.patient._id.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'You do not have access to this consultation' });
      }
    }
    // Admin can access any consultation (no filter)

    // Generate token for accessing the room
    const token = await DailyService.createToken(consultation.dailyRoomId, req.userId.toString(), {
      isOwner: req.userRole === 'patient' || req.userRole === 'doctor'
    });

    res.json({
      consultation,
      token
    });
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({ error: 'Failed to fetch consultation' });
  }
});

// Update consultation status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status value
    const validStatuses = ['pending', 'scheduled', 'accepted', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Find the consultation first
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Validate access based on user role
    if (req.userRole === 'doctor') {
      // Doctors can only update consultations they own
      if (!consultation.doctor || consultation.doctor.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'You do not have access to update this consultation' });
      }
    } else if (req.userRole === 'patient') {
      // Patients can only update their own consultations
      if (consultation.patient.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'You do not have access to update this consultation' });
      }
    }
    // Admin can update any consultation

    // Prevent updating already completed or cancelled consultations
    if (['completed', 'cancelled'].includes(consultation.status) && status !== consultation.status) {
      return res.status(400).json({ error: 'Cannot update a completed or cancelled consultation' });
    }

    const previousStatus = consultation.status;
    consultation.status = status;
    
    // Track when consultation actually started (first time going to in-progress)
    if (status === 'in-progress' && previousStatus !== 'in-progress') {
      consultation.actualStartTime = new Date();
    }
    
    if (status === 'completed') {
      consultation.endTime = new Date();
      // Calculate duration from actual start time if available, otherwise from scheduled start
      const startTime = consultation.actualStartTime || consultation.startTime;
      consultation.duration = Math.round(
        (consultation.endTime - startTime) / (1000 * 60)
      );
    }

    await consultation.save();
    res.json(consultation);
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({ error: 'Failed to update consultation' });
  }
});

module.exports = router;


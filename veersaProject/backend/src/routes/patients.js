const express = require('express');
const authMiddleware = require('../middleware/auth');
const Patient = require('../models/Patient');
const EncryptionService = require('../services/encryptionService');
const router = express.Router();

// Get current patient profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findById(req.userId).select('-password');
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Decrypt PHI data if present
    if (patient.encryptedPHI) {
      patient.medicalHistory = EncryptionService.decryptPHI(patient.encryptedPHI);
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update patient profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const patient = await Patient.findById(req.userId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Encrypt PHI data if medical history is being updated
    if (updates.medicalHistory) {
      updates.encryptedPHI = EncryptionService.encryptPHI(updates.medicalHistory);
    }

    Object.assign(patient, updates);
    await patient.save();

    res.json({ message: 'Patient profile updated successfully', patient });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


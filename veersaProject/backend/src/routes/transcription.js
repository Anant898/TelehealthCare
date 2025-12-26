const express = require('express');
const authMiddleware = require('../middleware/auth');
const Consultation = require('../models/Consultation');
const DeepGramService = require('../services/deepgramService');
const EncryptionService = require('../services/encryptionService');
const router = express.Router();

// Get transcription for consultation
router.get('/consultation/:consultationId', authMiddleware, async (req, res) => {
  try {
    const { consultationId } = req.params;

    // Build query based on user role
    let query = { _id: consultationId };
    
    if (req.userRole === 'doctor') {
      query.doctor = req.userId;
    } else if (req.userRole === 'patient') {
      query.patient = req.userId;
    }

    const consultation = await Consultation.findOne(query);

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    if (!consultation.transcript) {
      return res.json({ transcript: '' });
    }

    // Decrypt transcript
    const decryptedTranscript = EncryptionService.decryptPHI(consultation.transcript);

    res.json({ transcript: decryptedTranscript });
  } catch (error) {
    console.error('Get transcription error:', error);
    res.status(500).json({ error: 'Failed to fetch transcription' });
  }
});

// Save transcription
router.post('/consultation/:consultationId', authMiddleware, async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { transcript } = req.body;

    // Build query based on user role
    let query = { _id: consultationId };
    
    if (req.userRole === 'doctor') {
      query.doctor = req.userId;
    } else if (req.userRole === 'patient') {
      query.patient = req.userId;
    }

    const consultation = await Consultation.findOne(query);

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Encrypt transcript
    const encryptedTranscript = EncryptionService.encryptPHI(transcript);
    consultation.transcript = encryptedTranscript;
    await consultation.save();

    res.json({ message: 'Transcription saved successfully' });
  } catch (error) {
    console.error('Save transcription error:', error);
    res.status(500).json({ error: 'Failed to save transcription' });
  }
});

// Get DeepGram configuration for real-time transcription
router.get('/config', authMiddleware, async (req, res) => {
  try {
    const config = await DeepGramService.startTranscription(null, {
      language: 'en-US',
      model: 'nova-2',
      punctuate: true,
      smart_format: true
    });

    res.json(config);
  } catch (error) {
    console.error('Get transcription config error:', error);
    res.status(500).json({ error: 'Failed to get transcription configuration' });
  }
});

module.exports = router;


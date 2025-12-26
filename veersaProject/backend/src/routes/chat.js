const express = require('express');
const authMiddleware = require('../middleware/auth');
const ChatMessage = require('../models/Chat');
const Consultation = require('../models/Consultation');
const EncryptionService = require('../services/encryptionService');
const router = express.Router();

// Get chat messages for consultation
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

    const messages = await ChatMessage.find({ consultation: consultationId })
      .sort({ timestamp: 1 });

    // Decrypt messages
    const decryptedMessages = messages.map(msg => ({
      ...msg.toObject(),
      message: EncryptionService.decryptPHI(msg.message)
    }));

    res.json(decryptedMessages);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Send chat message
router.post('/consultation/:consultationId', authMiddleware, async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { message, messageType = 'text' } = req.body;

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

    // Encrypt message
    const encryptedMessage = EncryptionService.encryptPHI(message);

    // Determine sender model based on role
    const senderModel = req.userRole === 'doctor' ? 'Doctor' : 'Patient';

    // Create chat message
    const chatMessage = new ChatMessage({
      consultation: consultationId,
      sender: req.userId,
      senderModel: senderModel,
      message: encryptedMessage,
      messageType
    });

    await chatMessage.save();

    res.status(201).json({
      ...chatMessage.toObject(),
      message: message // Return decrypted message to sender
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;


const express = require('express');
const authMiddleware = require('../middleware/auth');
const Payment = require('../models/Payment');
const Consultation = require('../models/Consultation');
const SquareService = require('../services/squareService');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Get payment configuration (Square app ID and environment)
router.get('/config', authMiddleware, (req, res) => {
  const SQUARE_APPLICATION_ID = process.env.SQUARE_APPLICATION_ID;
  const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
  const SQUARE_ENVIRONMENT = process.env.SQUARE_ENVIRONMENT || 'sandbox';
  
  // Check if Square credentials exist
  const hasCredentials = !!SQUARE_APPLICATION_ID && !!SQUARE_ACCESS_TOKEN;
  
  // Log for debugging
  console.log('Square Config Check:', {
    hasAppId: !!SQUARE_APPLICATION_ID,
    hasToken: !!SQUARE_ACCESS_TOKEN,
    environment: SQUARE_ENVIRONMENT,
    configured: hasCredentials
  });

  res.json({
    squareApplicationId: hasCredentials ? SQUARE_APPLICATION_ID : null,
    squareEnvironment: SQUARE_ENVIRONMENT,
    configured: hasCredentials,
    testMode: false
  });
});

// Create payment for consultation
router.post('/consultation/:consultationId', authMiddleware, async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { sourceId, amount } = req.body;

    // Verify consultation belongs to patient
    const consultation = await Consultation.findOne({
      _id: consultationId,
      patient: req.userId
    });

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Check if payment already exists
    if (consultation.payment) {
      return res.status(400).json({ error: 'Payment already exists for this consultation' });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    // Validate sourceId
    if (!sourceId) {
      return res.status(400).json({ error: 'Payment source is required' });
    }

    // Process payment with Square
    const idempotencyKey = uuidv4();
    const squarePayment = await SquareService.createPayment(
      amount,
      sourceId,
      idempotencyKey,
      consultationId.toString()
    );

    // Create payment record
    const payment = new Payment({
      consultation: consultationId,
      patient: req.userId,
      squarePaymentId: squarePayment.id,
      amount,
      status: squarePayment.status === 'COMPLETED' ? 'completed' : 'pending',
      receiptUrl: squarePayment.receipt_url,
      paymentMethod: squarePayment.source_type
    });

    await payment.save();

    // Link payment to consultation
    consultation.payment = payment._id;
    await consultation.save();

    res.status(201).json({
      payment,
      squarePayment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Get payment details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      patient: req.userId
    }).populate('consultation');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Get updated status from Square
    const squarePayment = await SquareService.getPayment(payment.squarePaymentId);

    res.json({
      payment,
      squarePayment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

module.exports = router;


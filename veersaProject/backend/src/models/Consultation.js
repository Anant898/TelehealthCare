const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: false // Can be assigned later
  },
  specialty: {
    type: String,
    required: true
  },
  dailyRoomId: {
    type: String,
    required: true
  },
  dailyRoomUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: false
  },
  startTime: {
    type: Date,
    required: true
  },
  actualStartTime: {
    type: Date,
    required: false
  },
  endTime: {
    type: Date,
    required: false
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  transcript: {
    type: String,
    encrypted: true,
    required: false
  },
  notes: {
    type: String,
    encrypted: true,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

consultationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Consultation', consultationSchema);


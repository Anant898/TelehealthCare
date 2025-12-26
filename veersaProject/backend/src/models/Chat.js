const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: true
  },
  senderModel: {
    type: String,
    enum: ['Patient', 'Doctor'],
    required: true
  },
  message: {
    type: String,
    required: true,
    encrypted: true
  },
  messageType: {
    type: String,
    enum: ['text', 'transcription', 'system'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);


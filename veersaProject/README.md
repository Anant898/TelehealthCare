# Telehealth Solution - Veersa Hackathon 2026

A comprehensive telehealth solution with web and mobile applications for remote healthcare consultations.

## Features

- Patient registration and information capture
- Secure payment processing via Square
- High-quality video/audio consultations with Daily.co WebRTC
- Real-time chat during consultations
- Real-time transcription with DeepGram
- Secure PHI data encryption and storage
- Mobile apps for iOS and Android

## Project Structure

```
telehealth-app/
├── web/          # React web application
├── mobile/       # React Native/Expo mobile app
├── backend/      # Node.js/Express backend API
├── docs/         # Documentation
└── design/       # Design files (Figma/Adobe XD)
```

## Tech Stack

- **Frontend (Web)**: React, React Router, Daily.co Web SDK, Square Payments SDK
- **Mobile**: React Native, Expo, Daily.co React Native SDK
- **Backend**: Node.js, Express, Socket.io, JWT
- **Database**: PostgreSQL/MongoDB
- **APIs**: Daily.co, Square Payments, DeepGram Transcription

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup Instructions

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create .env file with your API keys (see backend/.env.example)
   npm run dev
   ```

2. **Web Frontend Setup**:
   ```bash
   cd web
   npm install
   npm run dev
   ```

3. **Mobile App Setup**:
   ```bash
   cd mobile
   npm install
   npm start
   ```

See individual README files in each directory for detailed setup instructions.

## Features Implemented

✅ Patient registration with specialty selection  
✅ Secure payment processing via Square  
✅ Video/audio consultations with Daily.co WebRTC  
✅ Real-time chat during consultations  
✅ Live transcription with DeepGram  
✅ PHI data encryption (AES-256)  
✅ JWT authentication  
✅ Network quality optimization  
✅ Mobile and web applications  
✅ Consistent medical theme UI  

## API Keys Required

- Daily.co API key (for video consultations)
- Square API credentials (for payments)
- DeepGram API key (for transcription)

## Documentation

- [Requirements](./docs/requirements.md)
- [Information Architecture](./docs/InformationArchitecture.md)
- [Test Cases](./docs/test-cases.md)
- [Design System](./docs/DesignSystem.md)

## License

This project is part of Veersa Hackathon 2026 submission.

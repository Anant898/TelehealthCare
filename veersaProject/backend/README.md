# Telehealth Backend API

Node.js/Express backend API for the telehealth solution.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/telehealth
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000

# Daily.co API
DAILY_API_KEY=your_daily_api_key
DAILY_API_URL=https://api.daily.co/v1

# Square Payment API
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=sandbox

# DeepGram Transcription API
DEEPGRAM_API_KEY=your_deepgram_api_key

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key

# Test Mode (Development)
# Set TEST=true to skip payment processing and always return success
TEST=false
```

3. Make sure MongoDB is running (or use MongoDB Atlas for cloud database)

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new patient
- `POST /api/auth/login` - Login patient

### Patients
- `GET /api/patients/me` - Get current patient profile
- `PUT /api/patients/me` - Update patient profile

### Consultations
- `POST /api/consultations` - Create a new consultation
- `GET /api/consultations` - Get patient's consultations
- `GET /api/consultations/:id` - Get specific consultation
- `PATCH /api/consultations/:id/status` - Update consultation status

### Payments
- `POST /api/payments/consultation/:consultationId` - Create payment for consultation
- `GET /api/payments/:id` - Get payment details

### Chat
- `GET /api/chat/consultation/:consultationId` - Get chat messages
- `POST /api/chat/consultation/:consultationId` - Send chat message

### Transcription
- `GET /api/transcription/consultation/:consultationId` - Get transcription
- `POST /api/transcription/consultation/:consultationId` - Save transcription
- `GET /api/transcription/config` - Get transcription configuration

## Security Features

- JWT authentication
- PHI data encryption (AES-256)
- Secure password hashing (bcrypt)
- HTTPS/TLS for data in transit


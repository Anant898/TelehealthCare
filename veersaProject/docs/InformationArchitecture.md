# Information Architecture - Telehealth Solution

## User Flows

### 1. Patient Registration Flow
```
Start → Select Specialty → Fill Registration Form → Submit → 
Payment Screen → Complete Payment → Dashboard
```

### 2. Consultation Flow
```
Dashboard → Create/Select Consultation → Payment (if not paid) → 
Consultation Room → Video Call + Chat + Transcription → End Consultation → Dashboard
```

### 3. Chat Flow (During Consultation)
```
Consultation Room → Open Chat → Type Message → Send → 
Message Appears in Real-time → Message Stored
```

### 4. Transcription Flow
```
Consultation Room → Transcription Starts Automatically → 
Live Transcript Displayed → Save Transcript → Stored Encrypted
```

## Screen Structure

### Web Application
- **Home Page**: Specialty selection and registration
- **Patient Dashboard**: List of consultations, create new consultation
- **Consultation Room**: Video call, chat sidebar, transcription panel
- **Payment Screen**: Payment form and processing

### Mobile Application
- **Home Screen**: Landing page with login/register options
- **Registration Screen**: Multi-step registration (specialty → form)
- **Dashboard Screen**: List of consultations
- **Payment Screen**: Payment processing
- **Consultation Screen**: Video call interface
- **Chat Screen**: Real-time messaging

## Data Models

### Patient
- Personal information (name, email, phone, DOB)
- Encrypted medical history
- Specialty preferences
- Consultation history

### Consultation
- Patient reference
- Doctor reference (optional)
- Specialty
- Daily.co room information
- Payment reference
- Status (scheduled, in-progress, completed, cancelled)
- Timestamps (start, end, duration)

### Payment
- Consultation reference
- Patient reference
- Square payment ID
- Amount and currency
- Status
- Receipt URL

### Chat Message
- Consultation reference
- Sender (patient/doctor)
- Encrypted message content
- Message type (text, transcription, system)
- Timestamp

## Navigation Structure

### Web Navigation
```
/ (Home)
├── /dashboard (Patient Dashboard)
└── /consultation/:id (Consultation Room)
```

### Mobile Navigation
```
Stack Navigator
├── Home
├── Registration
├── Dashboard
├── Payment
├── Consultation
└── Chat
```


# Test Cases Documentation

## Manual Test Cases

### TC-1: Patient Registration
**Preconditions**: User is on the home page
**Steps**:
1. Select a specialty
2. Fill in registration form with valid data
3. Submit the form

**Expected Result**: User is redirected to dashboard after successful registration

---

### TC-2: Payment Processing
**Preconditions**: User has created a consultation
**Steps**:
1. Click on "Join Consultation"
2. Complete payment form
3. Submit payment

**Expected Result**: Payment is processed successfully, user can access consultation

---

### TC-3: Video Consultation
**Preconditions**: Payment is completed
**Steps**:
1. Join consultation room
2. Verify video and audio are working
3. Toggle camera on/off
4. Toggle microphone on/off
5. Leave consultation

**Expected Result**: Video call works smoothly, controls function correctly

---

### TC-4: Real-time Chat
**Preconditions**: User is in an active consultation
**Steps**:
1. Open chat panel
2. Type and send a message
3. Verify message appears immediately
4. Check message history persists

**Expected Result**: Messages are sent and received in real-time, history is maintained

---

### TC-5: Transcription
**Preconditions**: User is in an active consultation
**Steps**:
1. Verify transcription starts automatically
2. Check transcript appears in real-time
3. Save transcript
4. Verify transcript is stored

**Expected Result**: Transcription works, transcript is saved securely

---

### TC-6: Network Quality Adaptation
**Preconditions**: User is in a video consultation
**Steps**:
1. Monitor network quality indicator
2. Simulate poor network conditions
3. Verify video quality adjusts automatically

**Expected Result**: Video quality adapts to network conditions smoothly

---

### TC-7: Data Encryption
**Preconditions**: User has registered and created consultations
**Steps**:
1. Check stored PHI data in database
2. Verify data is encrypted
3. Verify decryption works when retrieved

**Expected Result**: All PHI data is encrypted at rest, decrypts correctly when accessed

---

## API Test Cases

### API-TC-1: Patient Registration Endpoint
**Endpoint**: POST /api/auth/register
**Test Data**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "dateOfBirth": "1990-01-01",
  "medicalHistory": "No known allergies",
  "password": "password123",
  "specialty": "Cardiology"
}
```
**Expected**: 201 Created, returns token and patient data

---

### API-TC-2: Create Consultation Endpoint
**Endpoint**: POST /api/consultations
**Headers**: Authorization: Bearer <token>
**Test Data**:
```json
{
  "specialty": "Cardiology",
  "startTime": "2025-12-28T10:00:00Z"
}
```
**Expected**: 201 Created, returns consultation with Daily.co room info

---

### API-TC-3: Payment Endpoint
**Endpoint**: POST /api/payments/consultation/:id
**Headers**: Authorization: Bearer <token>
**Test Data**:
```json
{
  "sourceId": "cnon:test-payment",
  "amount": 50
}
```
**Expected**: 201 Created, returns payment record

---

## Security Test Cases

### SEC-TC-1: Authentication
**Test**: Verify JWT token is required for protected routes
**Expected**: 401 Unauthorized when token is missing or invalid

---

### SEC-TC-2: PHI Encryption
**Test**: Verify medical history is encrypted in database
**Expected**: Encrypted values stored, not plain text

---

### SEC-TC-3: HTTPS/TLS
**Test**: Verify all API calls use HTTPS
**Expected**: No unencrypted connections allowed

---

## Performance Test Cases

### PERF-TC-1: Video Quality
**Test**: Measure video call latency and frame rate
**Expected**: Latency < 500ms, frame rate ≥ 30fps on good network

---

### PERF-TC-2: Bandwidth Adaptation
**Test**: Test video quality on different network speeds
**Expected**: Quality adjusts automatically (low/medium/high)

---

### PERF-TC-3: Reconnection
**Test**: Simulate network drop and recovery
**Expected**: Automatic reconnection within 5 seconds


# How to Run Everything - Complete Setup Guide

This guide will walk you through setting up and running all components of the Telehealth Solution.

## Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Either:
  - Local MongoDB installation ([Download here](https://www.mongodb.com/try/download/community))
  - OR MongoDB Atlas account (free tier available) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **npm** (comes with Node.js)
- **Git** (to clone the repository if needed)

### Optional for Mobile Development:
- **Expo CLI** (for mobile app)
- **Xcode** (for iOS simulator - macOS only)
- **Android Studio** (for Android emulator)

## Required API Keys

You'll need to obtain API keys for the following services:

1. **Daily.co** - For video consultations
   - Sign up at: https://www.daily.co/
   - Get your API key from the dashboard

2. **Square** - For payment processing
   - Sign up at: https://squareup.com/
   - Create an application and get credentials (Sandbox for testing)

3. **DeepGram** - For transcription
   - Sign up at: https://deepgram.com/
   - Get your API key from the dashboard

---

## Step-by-Step Setup

### 1. Backend Setup

#### 1.1 Install Dependencies

```bash
cd backend
npm install
```

#### 1.2 Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# In backend directory
touch .env
```

Add the following content to `backend/.env`:

```env
# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/telehealth
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telehealth?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Daily.co API
DAILY_API_KEY=your_daily_api_key_here
DAILY_API_URL=https://api.daily.co/v1

# Square Payment API
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=sandbox

# DeepGram Transcription API
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Encryption Key (must be exactly 32 characters for AES-256)
ENCRYPTION_KEY=your_32_character_encryption_key!!
```

**Important Notes:**
- Replace all placeholder values with your actual API keys
- Generate a secure JWT_SECRET (you can use: `openssl rand -base64 32`)
- Generate a secure ENCRYPTION_KEY (must be exactly 32 characters)
- For MongoDB Atlas, replace the connection string with your cluster URL

#### 1.3 Start MongoDB

**If using local MongoDB:**
```bash
# On macOS (using Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
# MongoDB should start automatically as a service
```

**If using MongoDB Atlas:**
- Make sure your IP address is whitelisted in Atlas
- Use the connection string provided in your `.env` file

#### 1.4 Run the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# OR production mode
npm start
```

The backend API will be running at: `http://localhost:5000`

You can test it by visiting: `http://localhost:5000/health`

---

### 2. Web Frontend Setup

#### 2.1 Install Dependencies

Open a **new terminal window** (keep backend running):

```bash
cd web
npm install
```

#### 2.2 Configure Environment Variables

Create a `.env` file in the `web/` directory:

```bash
# In web directory
touch .env
```

Add the following content to `web/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SQUARE_APPLICATION_ID=your_square_app_id
```

**Note:** Replace `your_square_app_id` with your actual Square Application ID.

#### 2.3 Run the Web Application

```bash
npm run dev
```

The web app will automatically open at: `http://localhost:3000`

---

### 3. Mobile App Setup (Optional)

#### 3.1 Install Dependencies

Open a **new terminal window**:

```bash
cd mobile
npm install
```

#### 3.2 Install Expo CLI (if not already installed)

```bash
npm install -g expo-cli
# OR
npm install -g @expo/cli
```

#### 3.3 Run the Mobile App

```bash
# Start Expo development server
npm start

# OR run on specific platform
npm run ios      # For iOS simulator (macOS only)
npm run android  # For Android emulator
npm run web      # For web browser
```

This will open the Expo DevTools. You can:
- Scan the QR code with the Expo Go app on your phone
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Press `w` to open in web browser

---

## Running Everything Together

To run all components simultaneously, you'll need **3 terminal windows**:

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Web Frontend
```bash
cd web
npm run dev
```

### Terminal 3 - Mobile App (Optional)
```bash
cd mobile
npm start
```

---

## Quick Start Script (Optional)

You can create a simple script to start everything at once. Create a file `start-all.sh` in the root directory:

```bash
#!/bin/bash

# Start Backend
cd backend && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start Web Frontend
cd ../web && npm run dev &
WEB_PID=$!

# Wait for web to start
sleep 5

# Start Mobile (optional)
# cd ../mobile && npm start &

echo "Backend running on http://localhost:5000"
echo "Web app running on http://localhost:3000"
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait
```

Make it executable:
```bash
chmod +x start-all.sh
```

Run it:
```bash
./start-all.sh
```

---

## Verification Checklist

After starting all services, verify everything is working:

- [ ] Backend health check: Visit `http://localhost:5000/health` - should return `{"status":"OK"}`
- [ ] Web app loads: Visit `http://localhost:3000` - should show the homepage
- [ ] MongoDB connection: Check backend terminal for "MongoDB connected" message
- [ ] API endpoints accessible: Try registering a patient via the web interface

---

## Common Issues & Solutions

### MongoDB Connection Error
- **Issue:** `MongooseServerSelectionError`
- **Solution:** 
  - Make sure MongoDB is running (check with `mongod --version`)
  - Verify MONGODB_URI in `.env` is correct
  - For Atlas: Check IP whitelist and connection string

### Port Already in Use
- **Issue:** `Error: listen EADDRINUSE: address already in use :::5000`
- **Solution:** 
  - Find the process: `lsof -i :5000` (macOS/Linux) or `netstat -ano | findstr :5000` (Windows)
  - Kill the process or change PORT in `.env`

### Missing API Keys
- **Issue:** Features don't work (video, payments, transcription)
- **Solution:** 
  - Make sure all API keys are set in `backend/.env`
  - Verify keys are correct (no extra spaces)
  - Check service dashboards to ensure keys are active

### CORS Errors
- **Issue:** Web app can't connect to backend
- **Solution:** 
  - Verify `FRONTEND_URL` in backend `.env` matches web app URL
  - Check that backend is running before starting web app

---

## Production Deployment

For production deployment, you'll need to:

1. Set `NODE_ENV=production` in environment variables
2. Use secure, randomly generated secrets
3. Use HTTPS for all connections
4. Configure proper CORS origins
5. Set up environment-specific MongoDB clusters
6. Build the web app: `cd web && npm run build`
7. Use a process manager like PM2 for the backend: `pm2 start src/server.js`

---

## Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Web App Documentation](./web/README.md)
- [Mobile App Documentation](./mobile/README.md)
- [Project Requirements](./docs/requirements.md)

---

## Support

If you encounter any issues, check:
1. All environment variables are set correctly
2. All dependencies are installed (`npm install` in each directory)
3. MongoDB is running and accessible
4. Ports 5000 and 3000 are available
5. API keys are valid and active


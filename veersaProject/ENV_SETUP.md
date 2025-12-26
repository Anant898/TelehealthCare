# Step-by-Step Guide: Environment Variables Setup

This guide will walk you through creating all environment variable files needed for the Telehealth Solution project.

---

## Overview

This project requires environment variables in **3 locations**:
1. **Backend** (`backend/.env`) - Server configuration and API keys
2. **Web Frontend** (`web/.env`) - Frontend API configuration
3. **Mobile App** (`mobile/.env`) - Mobile app API configuration (optional but recommended)

---

## Step 1: Backend Environment Variables

### 1.1 Navigate to Backend Directory

```bash
cd backend
```

### 1.2 Create the `.env` File

```bash
touch .env
```

### 1.3 Open the File for Editing

You can use any text editor:
- **VS Code**: `code .env`
- **Nano**: `nano .env`
- **Vim**: `vim .env`
- Or any other text editor

### 1.4 Add Backend Environment Variables

Copy and paste the following template into `backend/.env`:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
FRONTEND_URL=http://localhost:3000

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/telehealth

# Option 2: MongoDB Atlas (Cloud) - Uncomment and use this instead
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telehealth?retryWrites=true&w=majority

# ============================================
# JWT AUTHENTICATION
# ============================================
# Generate a secure secret: openssl rand -base64 32
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# ============================================
# DAILY.CO API (Video Consultations)
# ============================================
# Sign up at: https://www.daily.co/
# Get your API key from: https://dashboard.daily.co/
DAILY_API_KEY=your_daily_api_key_here
DAILY_API_URL=https://api.daily.co/v1

# ============================================
# SQUARE PAYMENT API
# ============================================
# Sign up at: https://squareup.com/
# Create an application at: https://developer.squareup.com/apps
# Get credentials from: https://developer.squareup.com/apps/{your-app-id}/credentials
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=sandbox

# ============================================
# DEEPGRAM API (Transcription)
# ============================================
# Sign up at: https://deepgram.com/
# Get your API key from: https://console.deepgram.com/
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# ============================================
# ENCRYPTION KEY (PHI Data Protection)
# ============================================
# Must be exactly 32 characters for AES-256 encryption
# Generate one: openssl rand -hex 16
ENCRYPTION_KEY=your_32_character_encryption_key!!
```

### 1.5 Replace Placeholder Values

Now you need to replace the placeholder values with actual keys:

#### A. Generate JWT_SECRET

```bash
# Run this command in your terminal:
openssl rand -base64 32
```

Copy the output and replace `your_super_secret_jwt_key_change_this_in_production` with it.

#### B. Generate ENCRYPTION_KEY

```bash
# Run this command in your terminal:
openssl rand -hex 16
```

Copy the output and replace `your_32_character_encryption_key!!` with it. **Important**: The key must be exactly 32 characters.

#### C. Get Daily.co API Key

1. Go to https://www.daily.co/ and sign up/login
2. Navigate to https://dashboard.daily.co/
3. Go to the "Developers" or "API Keys" section
4. Create a new API key or copy an existing one
5. Replace `your_daily_api_key_here` with your actual API key

#### D. Get Square API Credentials

1. Go to https://squareup.com/ and sign up/login
2. Navigate to https://developer.squareup.com/apps
3. Create a new application (or use existing)
4. Go to your app's credentials page
5. Copy:
   - **Application ID** → Replace `your_square_app_id`
   - **Access Token** (Sandbox for testing) → Replace `your_square_access_token`
6. Keep `SQUARE_ENVIRONMENT=sandbox` for testing, or change to `production` for live payments

#### E. Get DeepGram API Key

1. Go to https://deepgram.com/ and sign up/login
2. Navigate to https://console.deepgram.com/
3. Go to API Keys section
4. Create a new API key or copy an existing one
5. Replace `your_deepgram_api_key_here` with your actual API key

#### F. Configure MongoDB

**Option 1: Local MongoDB**
- If you have MongoDB installed locally, keep: `MONGODB_URI=mongodb://localhost:27017/telehealth`
- Make sure MongoDB is running: `brew services start mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux)

**Option 2: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/login and create a free cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string from "Connect" → "Connect your application"
6. Replace `username`, `password`, and `cluster` in the connection string
7. Uncomment the Atlas line and comment out the local one

---

## Step 2: Web Frontend Environment Variables

### 2.1 Navigate to Web Directory

Open a new terminal or navigate back to the project root:

```bash
cd ../web
```

### 2.2 Create the `.env` File

```bash
touch .env
```

### 2.3 Open the File for Editing

```bash
code .env
# or use nano, vim, or any text editor
```

### 2.4 Add Web Environment Variables

Copy and paste the following template into `web/.env`:

```env
# ============================================
# API CONFIGURATION
# ============================================
# Backend API URL (should match your backend server)
REACT_APP_API_URL=http://localhost:5000/api

# ============================================
# SQUARE PAYMENT API
# ============================================
# Use the same Application ID from backend/.env
REACT_APP_SQUARE_APPLICATION_ID=your_square_app_id
```

### 2.5 Replace Placeholder Values

1. **REACT_APP_API_URL**: 
   - If your backend runs on a different port, change `5000` to that port
   - If deploying, change `localhost` to your backend URL

2. **REACT_APP_SQUARE_APPLICATION_ID**: 
   - Use the **same** `SQUARE_APPLICATION_ID` value from your `backend/.env` file
   - Copy it from `backend/.env` and paste it here

---

## Step 3: Mobile App Environment Variables (Optional)

The mobile app currently uses hardcoded values, but it's recommended to use environment variables for better configuration management.

### 3.1 Navigate to Mobile Directory

```bash
cd ../mobile
```

### 3.2 Create the `.env` File

```bash
touch .env
```

### 3.3 Open the File for Editing

```bash
code .env
# or use nano, vim, or any text editor
```

### 3.4 Add Mobile Environment Variables

Copy and paste the following template into `mobile/.env`:

```env
# ============================================
# API CONFIGURATION
# ============================================
# Backend API URL (should match your backend server)
# For Expo, use EXPO_PUBLIC_ prefix to expose to app
EXPO_PUBLIC_API_URL=http://localhost:5000/api

# ============================================
# SQUARE PAYMENT API
# ============================================
# Use the same Application ID from backend/.env
EXPO_PUBLIC_SQUARE_APPLICATION_ID=your_square_app_id
```

### 3.5 Replace Placeholder Values

1. **EXPO_PUBLIC_API_URL**: 
   - If your backend runs on a different port, change `5000` to that port
   - For physical devices, replace `localhost` with your computer's IP address (e.g., `http://192.168.1.100:5000/api`)
   - To find your IP: `ifconfig` (macOS/Linux) or `ipconfig` (Windows)

2. **EXPO_PUBLIC_SQUARE_APPLICATION_ID**: 
   - Use the **same** `SQUARE_APPLICATION_ID` value from your `backend/.env` file

**Note**: For Expo apps, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app. You'll also need to install `expo-constants` and configure your app to read these variables.

---

## Step 4: Verify Your Setup

### 4.1 Check Backend `.env` File

```bash
cd backend
cat .env
```

Verify that:
- ✅ No placeholder values remain (all `your_*` values are replaced)
- ✅ JWT_SECRET is a long random string
- ✅ ENCRYPTION_KEY is exactly 32 characters
- ✅ All API keys are filled in
- ✅ MongoDB URI is correct

### 4.2 Check Web `.env` File

```bash
cd ../web
cat .env
```

Verify that:
- ✅ REACT_APP_API_URL points to your backend
- ✅ REACT_APP_SQUARE_APPLICATION_ID matches backend value

### 4.3 Check Mobile `.env` File (if created)

```bash
cd ../mobile
cat .env
```

Verify that:
- ✅ EXPO_PUBLIC_API_URL points to your backend
- ✅ EXPO_PUBLIC_SQUARE_APPLICATION_ID matches backend value
- ✅ For physical devices, API URL uses your computer's IP instead of localhost

---

## Step 5: Security Checklist

Before running your application, ensure:

- [ ] `.env` files are in `.gitignore` (they should not be committed to git)
- [ ] All placeholder values have been replaced
- [ ] JWT_SECRET is a strong, random value
- [ ] ENCRYPTION_KEY is exactly 32 characters
- [ ] API keys are valid and active
- [ ] MongoDB connection string is correct
- [ ] For production, use `SQUARE_ENVIRONMENT=production` (not sandbox)

---

## Step 6: Quick Reference - All Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example/Notes |
|----------|-------------|---------------|
| `PORT` | Backend server port | `5000` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/telehealth` |
| `JWT_SECRET` | Secret for JWT token signing | Generate with `openssl rand -base64 32` |
| `DAILY_API_KEY` | Daily.co API key | Get from https://dashboard.daily.co/ |
| `DAILY_API_URL` | Daily.co API endpoint | `https://api.daily.co/v1` |
| `SQUARE_APPLICATION_ID` | Square application ID | Get from Square Developer Dashboard |
| `SQUARE_ACCESS_TOKEN` | Square access token | Get from Square Developer Dashboard |
| `SQUARE_ENVIRONMENT` | Square environment | `sandbox` or `production` |
| `DEEPGRAM_API_KEY` | DeepGram API key | Get from https://console.deepgram.com/ |
| `ENCRYPTION_KEY` | Encryption key for PHI data | Must be exactly 32 characters |

### Web Frontend (`web/.env`)

| Variable | Description | Example/Notes |
|----------|-------------|---------------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `REACT_APP_SQUARE_APPLICATION_ID` | Square application ID | Same as backend `SQUARE_APPLICATION_ID` |

### Mobile App (`mobile/.env`)

| Variable | Description | Example/Notes |
|----------|-------------|---------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` (or use IP for physical devices) |
| `EXPO_PUBLIC_SQUARE_APPLICATION_ID` | Square application ID | Same as backend `SQUARE_APPLICATION_ID` |

**Note**: Mobile app environment variables are optional. The app currently uses hardcoded values, but using `.env` is recommended for production.

---

## Troubleshooting

### Issue: "Missing environment variable" error

**Solution**: 
- Check that `.env` files are in the correct directories (`backend/` and `web/`)
- Verify no typos in variable names
- Restart your development server after changing `.env` files

### Issue: API keys not working

**Solution**:
- Verify keys are copied correctly (no extra spaces)
- Check that keys are active in their respective dashboards
- For Square, ensure you're using sandbox keys with `SQUARE_ENVIRONMENT=sandbox`

### Issue: MongoDB connection failed

**Solution**:
- Verify MongoDB is running (local) or cluster is accessible (Atlas)
- Check connection string format
- For Atlas, ensure IP is whitelisted

### Issue: Encryption key error

**Solution**:
- ENCRYPTION_KEY must be exactly 32 characters
- Generate a new one: `openssl rand -hex 16` (produces 32 hex characters)

---

## Next Steps

After setting up all environment variables:

1. **Start MongoDB** (if using local):
   ```bash
   brew services start mongodb-community  # macOS
   # or
   sudo systemctl start mongod  # Linux
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start Web Frontend** (in a new terminal):
   ```bash
   cd web
   npm install
   npm run dev
   ```

4. **Verify Setup**:
   - Backend: Visit http://localhost:5000/health
   - Web: Visit http://localhost:3000

---

## Additional Resources

- [Complete Setup Guide](./SETUP.md)
- [Backend README](./backend/README.md)
- [Web README](./web/README.md)
- [Docker Setup](./DOCKER.md)

---

**Note**: Never commit `.env` files to version control. They contain sensitive information and should remain local to your development environment.


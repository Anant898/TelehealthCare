# Telehealth Mobile Application

React Native/Expo mobile application for iOS and Android.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Expo CLI globally (if not already installed):
```bash
npm install -g expo-cli
```

3. Start the Expo development server:
```bash
npm start
```

4. Run on iOS simulator:
```bash
npm run ios
```

5. Run on Android emulator:
```bash
npm run android
```

## Build for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Features

- Native mobile UI with medical theme
- Patient registration and authentication
- Payment processing with Square
- Video consultations
- Real-time chat
- Mobile-optimized video quality

## Permissions

The app requires the following permissions:
- Camera (for video consultations)
- Microphone (for audio in consultations)
- Internet (for API calls and video streaming)


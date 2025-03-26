# Provider Frontend

A modern, mobile-first React Native application for healthcare providers to manage their services, appointments, and patient interactions.

## 📱 Overview

Provider Frontend is a cross-platform mobile application built with React Native and Expo, designed to offer healthcare providers a seamless experience for managing their practice. The application features a robust authentication system, comprehensive profile management, appointment scheduling, and secure communication channels.

## 🚀 Features

- **Authentication**
  - Google OAuth integration for single sign-on
  - Email OTP-based passwordless authentication
  - Secure token storage using expo-secure-store
  - Rate-limited OTP requests to prevent abuse

- **Provider Profile Management**
  - Comprehensive profile creation and editing
  - Specialty and service configuration
  - Availability management
  - Document and certification uploads

- **Appointment Management**
  - Calendar integration
  - Appointment scheduling and rescheduling
  - Appointment reminders and notifications
  - Patient history and notes

- **Communication**
  - Secure messaging with patients
  - Video consultation capabilities
  - File sharing and prescription management

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Context API with hooks
- **Navigation**: Expo Router
- **UI Components**: React Native Paper
- **Form Handling**: React Hook Form with Zod validation
- **API Integration**: Axios
- **Authentication**: JWT with secure storage
- **Testing**: Jest and React Testing Library

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for local development)
- Expo Go app (for testing on physical devices)

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kuzushi-labs/provider-frontend.git
   cd provider-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration values.

## 🚀 Running the App

### Development Mode

```bash
# Start the development server
npm start
# or
yarn start

# Run on iOS simulator
npm run ios
# or
yarn ios

# Run on Android emulator
npm run android
# or
yarn android
```

### Production Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 📁 Project Structure

```
provider-frontend/
├── app/                    # Expo Router app directory
│   ├── _layout.tsx         # Root layout component
│   ├── index.tsx           # Home screen
│   ├── auth/               # Authentication screens
│   ├── profile/            # Profile management screens
│   ├── appointments/       # Appointment management screens
│   └── messages/           # Communication screens
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── profile/        # Profile components
│   │   └── common/         # Common UI components
│   ├── constants/          # Application constants
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── store/              # State management
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── assets/                 # Static assets (images, fonts)
├── docs/                   # Documentation
├── .env.example            # Example environment variables
├── app.config.js           # Expo configuration
├── babel.config.js         # Babel configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## 🔐 Authentication Flow

### Google Authentication

1. User clicks the Google sign-in button
2. Google OAuth consent screen is displayed
3. User grants permission to the application
4. Backend verifies the Google ID token
5. JWT token is returned and stored securely
6. User is redirected to the appropriate screen

### Email OTP Authentication

1. User enters their email address
2. Backend generates and sends an OTP to the user's email
3. User enters the 6-digit OTP received
4. Backend verifies the OTP
5. JWT token is returned and stored securely
6. User is redirected to the appropriate screen

## 🔄 API Integration

The application communicates with the Provider Backend API for all data operations. API endpoints are defined in the `src/constants/api.ts` file:

```typescript
// Base API URL
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  REQUEST_OTP: `${API_URL}/auth/request-otp`,
  VERIFY_OTP: `${API_URL}/auth/verify-otp`,
  LOGIN: `${API_URL}/auth/login`,
  GOOGLE_AUTH: `${API_URL}/auth/google`,
};

// Provider endpoints
export const PROVIDER_ENDPOINTS = {
  PROFILE: `${API_URL}/providers/me`,
  UPDATE_PROFILE: `${API_URL}/providers/me`,
};
```

## 🧪 Testing

```bash
# Run all tests
npm test
# or
yarn test

# Run tests with coverage
npm test -- --coverage
# or
yarn test --coverage
```

## 📱 Environment Configuration

The application uses environment variables for configuration. Create a `.env` file with the following variables:

```
# API Configuration
EXPO_PUBLIC_API_URL=https://api.example.com/api/v1

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_GOOGLE_REDIRECT_URI=your-redirect-uri

# Feature Flags
EXPO_PUBLIC_ENABLE_VIDEO_CONSULTATIONS=true
```

## 🚢 Deployment

### App Store (iOS)

1. Configure your app in the Apple Developer Portal
2. Update the `app.json` file with your app's information
3. Build the app using EAS Build:
   ```bash
   eas build --platform ios
   ```
4. Submit to App Store using EAS Submit:
   ```bash
   eas submit --platform ios
   ```

### Google Play Store (Android)

1. Create your app in the Google Play Console
2. Update the `app.json` file with your app's information
3. Build the app using EAS Build:
   ```bash
   eas build --platform android
   ```
4. Submit to Google Play Store using EAS Submit:
   ```bash
   eas submit --platform android
   ```

## 🔄 CI/CD

The project uses GitHub Actions for continuous integration and deployment:

- **Pull Request Workflow**: Runs tests and linting on every pull request
- **Main Branch Workflow**: Builds and deploys to staging environment
- **Release Workflow**: Builds and submits to app stores

## 📚 Additional Documentation

- [Authentication](./docs/authentication.md)
- [API Integration](./docs/api-integration.md)
- [Component Library](./docs/component-library.md)
- [State Management](./docs/state-management.md)
- [Testing Strategy](./docs/testing-strategy.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please contact the development team at support@kuzushilabs.com or open an issue in the GitHub repository.

---

Built with ❤️ by Kuzushi Labs

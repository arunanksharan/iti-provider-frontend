# Authentication Flows

This document describes the authentication flows implemented in the Provider Frontend application.

## Email and OTP Authentication

The application uses a two-step email and OTP (One-Time Password) authentication flow:

1. **Email Input**:
   - User enters their email address
   - Frontend sends the email to the backend API
   - Backend generates and sends an OTP to the user's email

2. **OTP Verification**:
   - User enters the OTP received in their email
   - Frontend sends the email and OTP to the backend API
   - Backend verifies the OTP and returns JWT tokens
   - Frontend stores the tokens and authenticates the user

## Google Authentication

The application supports Google authentication for both sign-in and sign-up through a backend-driven flow:

### Complete End-to-End Flow

1. **User Initiates Authentication**:
   - User clicks "Sign in with Google" or "Sign up with Google" button in the `GoogleAuthButtons` component
   - The component constructs a URL to the backend API with a redirect URI parameter:
     ```
     ${API_BASE_URL}/auth/google/signin?redirect_uri=provider-frontend://auth/google/callback?mode=signin
     ```
   - The app opens this URL using `Linking.openURL()`, which launches the device browser

2. **Backend OAuth Flow** (implemented on backend):
   - Backend receives the request with the redirect URI
   - Backend initiates OAuth flow with Google
   - User authenticates with Google and grants permissions
   - Google redirects back to backend with an authorization code
   - Backend exchanges the code for Google tokens
   - Backend creates/authenticates the user and generates a JWT token

3. **Redirect Back to App**:
   - Backend redirects to the provided redirect URI:
     ```
     provider-frontend://auth/google/callback?mode=signin&token=<jwt_token>
     ```
   - Mobile OS opens the app due to the URL scheme matching

4. **App Handles Callback**:
   - The app opens the `google-callback.tsx` screen based on the deep link
   - The callback screen extracts the token and mode from the URL parameters

5. **Complete Authentication**:
   - The callback screen calls the appropriate method in the auth context:
     - `googleSignIn(token)` for sign in
     - `googleSignUp(token)` for sign up
   - The auth service sends the token to the backend API:
     - `/auth/google-signin` for sign in
     - `/auth/google-signup` for sign up
   - The backend validates the token and returns JWT tokens
   - The auth service stores the tokens in secure storage
   - The auth context updates the authentication state
   - User is redirected to the authenticated section of the app

### Technical Implementation Details

1. **Deep Linking Configuration**:
   - URL scheme: `provider-frontend://`
   - Configured in `app.config.js` for both iOS and Android
   - Deep link handler in `_layout.tsx` for global handling

2. **Components Involved**:
   - `GoogleAuthButtons.tsx`: Provides the sign in/up buttons and initiates the flow
   - `google-callback.tsx`: Handles the callback from Google/backend
   - `auth.ts`: Service that communicates with the backend API
   - `auth-context.tsx`: Manages authentication state and exposes methods

3. **Security Considerations**:
   - The app never directly interacts with Google Auth
   - All sensitive operations happen on the backend
   - Tokens are securely stored using Expo SecureStore

## JWT Token Management

The application uses JWT (JSON Web Tokens) for authentication:

1. **Token Storage**:
   - Access token and refresh token are stored securely using Expo SecureStore
   - Tokens are encrypted on the device

2. **Token Refresh**:
   - When the access token expires, the app automatically uses the refresh token to get a new access token
   - If the refresh token is invalid or expired, the user is logged out

3. **Logout**:
   - On logout, the app calls the backend logout endpoint
   - All tokens are cleared from the device storage

## Security Considerations

1. **Token Security**:
   - Tokens are stored securely using Expo SecureStore
   - No sensitive information is stored in local storage or AsyncStorage

2. **API Security**:
   - All API requests use HTTPS
   - Authentication tokens are sent in the Authorization header

3. **Error Handling**:
   - Authentication errors are properly handled and displayed to the user
   - Failed authentication attempts are logged for security monitoring

## Authentication Documentation

This document outlines the authentication flows implemented in the Provider Frontend application.

## Authentication Methods

The Provider Frontend supports two authentication methods:

1. **Google Authentication**: Single sign-on using Google OAuth
2. **Email OTP Authentication**: Passwordless authentication using email and one-time passwords

## Google Authentication Flow

The Google authentication flow allows users to sign in or sign up using their Google account:

1. User clicks the Google sign-in button
2. Google OAuth consent screen is displayed
3. User grants permission to the application
4. Backend verifies the Google ID token
5. JWT token is returned and stored securely
6. User is redirected to the appropriate screen based on their account status

## Email OTP Authentication Flow

The email OTP authentication flow provides a passwordless login experience:

1. **Email Input**:
   - User enters their email address
   - Frontend validates the email format
   - Backend checks if the provider exists
   - OTP is generated and sent to the user's email

2. **OTP Verification**:
   - User enters the 6-digit OTP received via email
   - Frontend validates the OTP format
   - Backend verifies the OTP against the stored value
   - If valid, JWT token is returned and stored securely
   - User is redirected to the appropriate screen

3. **Resend Functionality**:
   - User can request a new OTP if needed
   - A countdown timer prevents abuse (60 seconds between requests)
   - Clear feedback is provided on the UI

## Security Considerations

- JWT tokens are stored using `expo-secure-store` for secure storage
- Rate limiting is implemented on the backend to prevent abuse
- OTPs expire after 10 minutes for security
- Input validation is performed on both client and server sides

## Component Structure

### Google Authentication

The `GoogleAuthButtons` component handles the Google authentication flow, providing:
- A single sign-in button with a toggle for sign-up
- Clear visual feedback during authentication
- Error handling and retry options

### Email OTP Authentication

The email OTP authentication flow is handled by two main components:

1. **EmailInput**: Collects and validates the user's email address
2. **OTPVerification**: Handles OTP input, verification, and resend functionality

## Error Handling

The authentication components handle various error scenarios:

- Invalid email format
- Non-existent provider accounts
- Invalid or expired OTPs
- Rate limiting errors
- Network connectivity issues

## Implementation Details

### Token Storage

Authentication tokens are stored securely using `expo-secure-store`, which provides:
- Encrypted storage on the device
- Protection against unauthorized access
- Automatic clearing when the app is uninstalled

### API Integration

The authentication components interact with the backend API using:
- Axios for HTTP requests
- Proper error handling and retry logic
- Loading states for better user experience

## Best Practices

When working with the authentication components:

1. Always handle loading and error states appropriately
2. Provide clear feedback to users during the authentication process
3. Implement proper validation before submitting data to the API
4. Use the secure token storage mechanisms provided

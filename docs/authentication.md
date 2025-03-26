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

# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the EngineerConnect application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: "EngineerConnect"
   - User support email: Your email
   - Developer contact information: Your email
4. Add the following scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users if needed (for external apps)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. Click "Create"

## Step 4: Get Your Client ID

After creating the OAuth 2.0 client, you'll get a Client ID. Copy this ID.

## Step 5: Configure Environment Variables

Create a `.env` file in the `engineer_connect-app` directory with the following content:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# Other Configuration
REACT_APP_ENVIRONMENT=development
```

Replace `your_google_client_id_here` with the actual Client ID from Step 4.

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   cd engineer_connect-app
   npm start
   ```

2. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

3. Navigate to the login or signup page
4. You should see a "Continue with Google" button
5. Click the button and test the authentication flow

## Troubleshooting

### Common Issues:

1. **"Invalid Client ID" error**
   - Make sure the Client ID is correct
   - Ensure the domain is added to authorized origins

2. **"Redirect URI mismatch" error**
   - Check that your domain is added to authorized redirect URIs
   - Make sure there are no trailing slashes

3. **"OAuth consent screen not configured" error**
   - Complete the OAuth consent screen setup
   - Add your email as a test user if using external app type

### Security Notes:

- Never commit your `.env` file to version control
- Use different Client IDs for development and production
- Regularly rotate your OAuth credentials
- Monitor your OAuth usage in Google Cloud Console

## Production Deployment

For production deployment:

1. Create a new OAuth 2.0 client ID for production
2. Add your production domain to authorized origins and redirect URIs
3. Update your environment variables with the production Client ID
4. Ensure your backend is properly configured for production

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Documentation](https://github.com/MomenSherif/react-oauth)
- [Google Cloud Console](https://console.cloud.google.com/)

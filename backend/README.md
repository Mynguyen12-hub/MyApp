# Backend Setup - Password Reset Endpoint

## Quick Start

### 1. Download Firebase Service Account Key
- Go to Firebase Console → Your Project → Settings (gear icon) → Service Accounts
- Click "Generate New Private Key"
- Save the JSON file as `serviceAccountKey.json` in the `backend/` folder

### 2. Install Dependencies
```bash
cd backend
npm install express firebase-admin cors body-parser
```

### 3. Run Backend Server
```bash
node resetPassword.js
```

The server will start on `http://localhost:3000`

### 4. Test the Endpoint
```bash
curl -X POST http://localhost:3000/api/resetPassword \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","newPassword":"newPassword123"}'
```

## Production Deployment

### Option A: Firebase Cloud Functions (Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Move code to `functions/` folder
3. Deploy: `firebase deploy --only functions`
4. Update `BACKEND_URL` in `ForgotPassword.tsx` to your Cloud Function URL

### Option B: Heroku
1. Create Heroku account
2. Install Heroku CLI
3. Run: `heroku create your-app-name`
4. Deploy: `git push heroku main`
5. Update `BACKEND_URL` in `ForgotPassword.tsx`

### Option C: Other Platforms (AWS, Google Cloud, etc.)
Deploy to your preferred platform and update `BACKEND_URL`.

## Security Notes
- Keep `serviceAccountKey.json` private (add to `.gitignore`)
- In production, add authentication/rate-limiting to `/api/resetPassword`
- Use HTTPS for all requests
- Consider adding email verification before password reset
- Add logging and monitoring for security events

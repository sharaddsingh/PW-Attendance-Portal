# 🔧 Fix Firebase Authentication Error

## Error: `auth/configuration-not-found`

This error occurs because Firebase Authentication is not enabled in your project.

## ✅ Quick Fix Steps

### 1. Enable Firebase Authentication (Just Opened in Browser)

The Firebase Console should now be open in your browser. Follow these steps:

1. **Click "Get started"** if you see the welcome screen
2. Go to **"Sign-in method"** tab
3. Find **"Google"** in the providers list
4. **Click on Google provider**
5. Toggle **"Enable"** switch to ON
6. Fill in:
   - **Project public-facing name**: `PW Attendance Portal`
   - **Project support email**: `sharadxsinghh@gmail.com`
7. Click **"Save"**

### 2. Verify OAuth Configuration

After enabling Google Sign-In:

1. Stay in the **Authentication** section
2. Go to **"Settings"** tab
3. Click **"Authorized domains"**
4. Make sure these domains are listed:
   - `pw-attendance-portal.firebaseapp.com`
   - `pw-attendance-portal.web.app`
   - `localhost`

### 3. Check API Keys

1. Go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Find your web app
4. Verify the Firebase config matches your code

### 4. Test Authentication

After setup, test by:

```bash
# Restart your development server
npm run dev
```

Then try clicking the Faculty button again.

## 🔍 Verify Configuration in Code

Check that your `src/services/firebase.js` has the correct configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxfX7g9a9H-skqP10z-aj-JPI4-9-8078",
  authDomain: "pw-attendance-portal.firebaseapp.com",
  projectId: "pw-attendance-portal",
  storageBucket: "pw-attendance-portal.firebasestorage.app",
  messagingSenderId: "205349770163",
  appId: "1:205349770163:web:d792a6a75aaa77e92b71c6",
  measurementId: "G-Y1NJV2C6DX"
};
```

## 🚨 Common Issues and Solutions

### Issue 1: Still getting the same error
**Solution**: Clear browser cache and cookies, then restart the dev server.

### Issue 2: Popup blocked error
**Solution**: Allow popups for localhost in your browser settings.

### Issue 3: Invalid OAuth client
**Solution**: 
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Check OAuth 2.0 Client IDs

## 📝 Manual API Enable (if needed)

If the above doesn't work, enable these APIs manually:

```bash
# Enable Identity Toolkit API
Start-Process "https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=pw-attendance-portal"

# Enable Firebase Auth API
Start-Process "https://console.cloud.google.com/apis/library/firebaseauth.googleapis.com?project=pw-attendance-portal"
```

## ✅ Success Indicators

You'll know it's working when:
1. No error appears when clicking Faculty/Student buttons
2. Google Sign-In popup appears
3. You can select a Google account
4. Successfully redirected to profile completion page

## 🔄 After Fixing

Once authentication is working:

1. Sign in with a Gmail account for Faculty
2. Complete your profile
3. Test QR code generation
4. Test student sign-in with @pwioi.com email (or modify validation temporarily)

---

**Need more help?** The Firebase Console should be open in your browser now. Follow the steps above to enable Google Authentication.
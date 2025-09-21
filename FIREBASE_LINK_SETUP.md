# 🔗 Firebase Project Linking Setup

## ✅ Completed Steps

1. ✅ **Firebase CLI installed** - Version 14.17.0
2. ✅ **Logged in to Firebase** - Using sharadxsinghh@gmail.com
3. ✅ **Project selected** - pw-attendance-portal
4. ✅ **Firebase initialized** - Configuration files created
5. ✅ **Firestore rules deployed** - Security rules are active

## 🔴 Required Actions in Firebase Console

Please complete these steps in the Firebase Console:

### 1. Enable Firestore Database
1. Go to: https://console.firebase.google.com/project/pw-attendance-portal/firestore
2. Click **"Create database"**
3. Choose **"Production mode"** 
4. Select location: **asia-south1 (Mumbai)** or your nearest region
5. Click **"Enable"**

### 2. Enable Firebase Storage
1. Go to: https://console.firebase.google.com/project/pw-attendance-portal/storage
2. Click **"Get started"**
3. Review security rules and click **"Next"**
4. Select same location as Firestore
5. Click **"Done"**

### 3. Enable Authentication
1. Go to: https://console.firebase.google.com/project/pw-attendance-portal/authentication
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Google"**
5. Enable it and configure:
   - Project public-facing name: **PW Attendance Portal**
   - Support email: **sharadxsinghh@gmail.com**
6. Click **"Save"**

## 🚀 After Enabling Services, Run These Commands

Once you've enabled the services in Firebase Console, run these commands in VS Code terminal:

```bash
# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy everything at once
firebase deploy
```

## 📁 VS Code Firebase Extension (Optional)

For better Firebase integration in VS Code, install the Firebase extension:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for **"Firebase"** by **"toba"**
4. Install the extension
5. Restart VS Code

## 🔧 Configure VS Code Settings

Add these to your VS Code workspace settings (`.vscode/settings.json`):

```json
{
  "firebase.project": "pw-attendance-portal",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.semi": true,
  "prettier.singleQuote": false,
  "prettier.tabWidth": 2
}
```

## 🧪 Test Firebase Connection

After setup, test your Firebase connection:

```bash
# Test Firestore connection
firebase firestore:indexes

# Check current project
firebase use

# View project details
firebase projects:get pw-attendance-portal
```

## 📱 Update Environment Variables

Create a `.env.local` file in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDxfX7g9a9H-skqP10z-aj-JPI4-9-8078
VITE_FIREBASE_AUTH_DOMAIN=pw-attendance-portal.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pw-attendance-portal
VITE_FIREBASE_STORAGE_BUCKET=pw-attendance-portal.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=205349770163
VITE_FIREBASE_APP_ID=1:205349770163:web:d792a6a75aaa77e92b71c6
VITE_FIREBASE_MEASUREMENT_ID=G-Y1NJV2C6DX
```

## 🎯 Quick Links

- **Firebase Console**: https://console.firebase.google.com/project/pw-attendance-portal/overview
- **Firestore**: https://console.firebase.google.com/project/pw-attendance-portal/firestore
- **Storage**: https://console.firebase.google.com/project/pw-attendance-portal/storage
- **Authentication**: https://console.firebase.google.com/project/pw-attendance-portal/authentication
- **Hosting**: https://console.firebase.google.com/project/pw-attendance-portal/hosting

## ✅ Final Verification

Once everything is set up, verify with:

```bash
# Check deployment status
firebase deploy --only firestore:rules,storage:rules,firestore:indexes

# Run the app locally
npm run dev

# Test features:
# 1. Sign in with Google
# 2. Complete profile
# 3. Generate QR code (Faculty)
# 4. Scan QR code (Student)
```

## 🛟 Troubleshooting

If you encounter issues:

1. **Permission errors**: Check if all services are enabled in Firebase Console
2. **API errors**: Wait 2-3 minutes after enabling APIs
3. **Authentication issues**: Verify Google Sign-In is enabled
4. **Storage errors**: Ensure Storage bucket is created

---

**Status**: Awaiting Firebase Console setup
**Next Step**: Enable Firestore, Storage, and Authentication in Firebase Console
# Firebase Setup Guide for EduNFT

## 1. Firebase Console Setup

### Step 1: Create Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `edu-nft-1e358`
3. Go to **Firestore Database** in the left sidebar
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for development)
6. Select a location (choose closest to your users)

### Step 2: Set Firestore Security Rules
1. Go to **Firestore Database** > **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Certificates collection - authenticated users can read, only authorized roles can write
    match /certificates/{certificateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.issuerId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['university', 'training']);
    }
    
    // Organizations collection - authenticated users can read, admins can write
    match /organizations/{organizationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

3. Click **"Publish"**

### Step 3: Enable Authentication
1. Go to **Authentication** in the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**
5. Enable **"Google"** (optional)

## 2. Test the Setup

### Check if Firestore is working:
1. Go to **Firestore Database** > **Data**
2. You should see an empty database
3. After creating a user profile, you should see a `users` collection

### Check Authentication:
1. Go to **Authentication** > **Users**
2. You should see registered users here

## 3. Common Issues

### Issue: "Failed to update profile"
**Solution:**
- Make sure Firestore database is created
- Check if security rules allow authenticated users to write
- Verify Firebase config in your app

### Issue: "Permission denied"
**Solution:**
- Check Firestore security rules
- Make sure user is authenticated
- Verify user UID matches document ID

### Issue: "Document not found"
**Solution:**
- The app will automatically create the document if it doesn't exist
- Check console logs for detailed error messages

## 4. Firebase Config

Your current Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC_D82abt5-ctidnSenK2_i-fRqSoUu3E8",
  authDomain: "edu-nft-1e358.firebaseapp.com",
  projectId: "edu-nft-1e358",
  storageBucket: "edu-nft-1e358.firebasestorage.app",
  messagingSenderId: "285745583837",
  appId: "1:285745583837:web:f90d9b6db7554d009a6d34",
  measurementId: "G-Y4RCRYY7TJ"
};
```

## 5. Testing

1. Register a new user
2. Complete the profile
3. Check Firestore Database > Data > users collection
4. Verify the user document is created with all fields

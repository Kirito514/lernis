# Firebase Firestore Security Rules

Firebase Firestore'da permission xatosi bo'lsa, quyidagi security rules'ni sozlang:

## Firestore Security Rules

Firebase Console'ga kiring: https://console.firebase.google.com/
1. Project'ni tanlang: `edu-nft-1e358`
2. Firestore Database → Rules bo'limiga o'ting
3. Quyidagi rules'ni qo'ying:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Certificates collection - authenticated users can read/write
    match /certificates/{certificateId} {
      allow read, write: if request.auth != null;
    }
    
    // Pending certificates collection - authenticated users can read/write
    match /pendingCertificates/{certificateId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Alternative: Development Mode (Temporary)

Agar tez test qilish kerak bo'lsa, development mode'ni yoqing:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **DIQQAT**: Development mode'ni production'da ishlatmaslik kerak!

## Rules'ni Qo'llash

1. Rules'ni yozing
2. "Publish" tugmasini bosing
3. Bir necha daqiqa kutib turing
4. Saytni qayta yuklang

## Test Qilish

Rules qo'llangandan keyin:
1. Dashboard'ga kiring
2. Certificate yarating
3. Console'da xatolar yo'qolganini tekshiring

# Firebase Setup Instructions

## Firebase konfiguratsiyasini o'rnatish

### 1. Firebase Console'ga kiring
- [Firebase Console](https://console.firebase.google.com/) ga kiring
- Yangi loyiha yarating yoki mavjud loyihani tanlang

### 2. Web app qo'shing
- "Add app" tugmasini bosing
- "Web" ni tanlang (</> belgisi)
- App nomini kiriting (masalan: "lernis-web")
- "Register app" tugmasini bosing

### 3. Konfiguratsiya ma'lumotlarini oling
```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. src/firebase/config.ts faylini yangilang
```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-actual-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-actual-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### 5. Authentication'ni yoqing
- Authentication > Sign-in method ga kiring
- Email/Password ni yoqing
- Google ni yoqing va konfiguratsiya qiling

### 6. Firestore Database'ni yoqing
- Firestore Database > Create database
- Test mode'da boshlang (keyinchalik security rules qo'shish mumkin)
- Location tanlang (masalan: us-central1)

### 7. Security Rules (ixtiyoriy)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Foydalanuvchilar faqat o'z ma'lumotlarini o'qishi va yozishi mumkin
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Loyihani ishga tushirish

1. Firebase konfiguratsiyasini to'ldiring
2. `pnpm run dev` buyrug'ini ishga tushiring
3. Register sahifasida yangi hisob yarating
4. Login sahifasida kirish qiling
5. Dashboard va Wallet sahifalariga kirish mumkin

## Xavfsizlik eslatmalari

- Firebase API key'ni public repository'ga joylamang
- Production'da environment variables ishlating
- Firestore security rules'ni to'g'ri sozlang
- Authentication state'ni to'g'ri boshqaring


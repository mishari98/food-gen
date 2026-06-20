# Firebase Setup Guide — FoodGen Web

**Time required:** ~10 minutes  
**Cost:** $0 (free tier)

---

## Step 1: Create a Firebase Project

1. Open your browser and go to **https://console.firebase.google.com/**
2. Click the **"Create a project"** button (blue)
3. Enter project name: **FoodGen**
4. **Toggle OFF** "Enable Google Analytics for this project" (not needed)
5. Click **"Create project"**
6. Wait ~30 seconds for the project to be provisioned
7. Click **"Continue"**

---

## Step 2: Enable Anonymous Authentication

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Find **"Anonymous"** in the provider list
5. Click the **pencil/edit icon** on the right
6. **Toggle ON** "Enable Anonymous sign-in"
7. Click **"Save"**

✅ Anonymous auth is now active

---

## Step 3: Enable Firestore Database

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll update rules later)
4. Click **"Next"**
5. Choose a region:
   - If you're in Australia: **australia-southeast1** (Sydney)
   - If unsure: **us-central1** is fine
6. Click **"Enable"**
7. Wait ~10 seconds for the database to provision

✅ Firestore is now active

---

## Step 4: Get Firebase Config (Keys)

1. In the left sidebar, click the **gear icon ⚙️** → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **"Web" icon </>** (if you already have one, skip to step 6)
4. Enter app nickname: **"FoodGen Web"**
5. Click **"Register app"**
6. You'll see a block of code like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB_...",
  authDomain: "foodgen-xxxxx.firebaseapp.com",
  projectId: "foodgen-xxxxx",
  storageBucket: "foodgen-xxxxx.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

7. **Copy these config values** (the `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId`)

---

## Step 5: Update Firestore Security Rules

1. In the left sidebar, click **"Firestore Database"**
2. Go to the **"Rules"** tab
3. Replace the existing rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

4. Click **"Publish"**

✅ Security rules are set

---

## ✅ You're Done!

Now **paste the config values here** so I can add them to the app:

```
apiKey:
authDomain:
projectId:
storageBucket:
messagingSenderId:
appId:
```

Once I have these, I'll implement the Firebase Auth + Firestore integration and all the UI enhancements.
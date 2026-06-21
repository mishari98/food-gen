# FoodGen Web — Deployment Guide

## What Happened?

We deployed the **FoodGen Web app** to **Firebase Hosting**, which is a free web hosting service from Google. Your app is now live at:

**🔗 https://foodgen-85dbb.web.app**

This means:
- ✅ Anyone with the URL can access the app
- ✅ Works on iPhone, Android, laptop, desktop
- ✅ No need to install anything — just open the browser
- ✅ Free hosting (Firebase free tier includes hosting)
- ✅ Automatic HTTPS (secure connection)

---

## How We Deployed (Step by Step)

Here's exactly what we did, so you can do it again in the future:

### Prerequisites (One-Time Setup)

1. **Node.js** — Already installed on your machine
2. **Firebase project** — Already created (`foodgen-85dbb`)
3. **Firebase config** — Already in `src/firebase/config.ts`

### Step 1: Build the App

Before deploying, we need to create a production build:

```bash
cd FoodGenWeb
npx vite build
```

This creates a `dist/` folder with all the compiled files (HTML, CSS, JS).

### Step 2: Install Firebase CLI (One-Time)

```bash
npm install -g firebase-tools
```

This installs the Firebase command-line tool globally.

### Step 3: Login to Firebase (One-Time)

```bash
npx firebase login
```

This opens a browser window to log in with your Google account (misharijoel@gmail.com).

### Step 4: Create Firebase Hosting Config Files (One-Time)

Two files were created:

**`firebase.json`** — Tells Firebase where your built files are:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**`.firebaserc`** — Links to your Firebase project:
```json
{
  "projects": {
    "default": "foodgen-85dbb"
  }
}
```

### Step 5: Deploy to Firebase Hosting

```bash
cd FoodGenWeb
npx firebase deploy --only hosting
```

This uploads the `dist/` folder to Firebase and makes it live.

---

## How to Deploy Again (Future Updates)

Whenever you make changes to the app and want to publish them:

```bash
# 1. Go to the project folder
cd FoodGenWeb

# 2. Build the app
npx vite build

# 3. Deploy to Firebase
npx firebase deploy --only hosting
```

That's it! Your changes will be live in about 30 seconds.

---

## How to Test Locally (Before Deploying)

If you want to see changes on your machine first:

```bash
cd FoodGenWeb
npx vite
```

This starts a local server at `http://localhost:5173` — open this in your browser.

---

## How to Test on iPhone (Before Deploying)

1. Run `npx vite` on your Windows machine
2. Find your Windows machine's local IP address (run `ipconfig` in cmd)
3. On your iPhone, open Safari and go to `http://YOUR_IP:5173`
4. Both devices must be on the same WiFi network

---

## Deployment Checklist

| Step | Command | When |
|------|---------|------|
| Build | `npx vite build` | Every time you want to deploy |
| Deploy | `npx firebase deploy --only hosting` | Every time you want to publish |
| Login | `npx firebase login` | Only once (or if you log out) |

---

## Important Notes

- **The app URL is permanent**: `https://foodgen-85dbb.web.app`
- **Firebase free tier**: 10GB storage, 360MB bandwidth/day — plenty for a family app
- **Custom domain**: You can add a custom domain (like `foodgen.yourname.com`) later in Firebase Console → Hosting
- **The app is a SPA** (Single Page Application): The `rewrites` rule in `firebase.json` ensures all routes work correctly (e.g., `/day`, `/week`, `/settings`)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `firebase: command not found` | Run `npm install -g firebase-tools` first |
| `Failed to authenticate` | Run `npx firebase login` to log in |
| Build fails | Check for TypeScript errors with `npx tsc --noEmit` |
| App shows blank page | Check browser console for errors |
| Routes don't work | Make sure `firebase.json` has the `rewrites` section |

---

*Document created June 2026 — FoodGen Web Deployment Guide*
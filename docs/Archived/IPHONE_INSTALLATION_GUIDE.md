# FoodGen — iPhone Installation Guide (Without App Store)

## Table of Contents

1. [Overview](#1-overview)
2. [Important: iOS Limitations](#2-important-ios-limitations)
3. [Free Alternatives](#3-free-alternatives)
4. [Option A: Expo Go (Development/Testing)](#4-option-a-expo-go-developmenttesting)
5. [Option B: Expo Web (Web App - Free)](#5-option-b-expo-web-web-app---free)
6. [Option C: Android APK (Free)](#6-option-c-android-apk-free)
7. [Paid Option: EAS Build (iOS Real App)](#7-paid-option-eas-build-ios-real-app)
8. [Step-by-Step: EAS Build Setup](#8-step-by-step-eas-build-setup)
9. [Installing the Built App on iPhone](#9-installing-the-built-app-on-iphone)
10. [Troubleshooting](#10-troubleshooting)
11. [Cost Summary](#11-cost-summary)
12. [Comparison Table](#12-comparison-table)

---

## 1. Overview

This guide explains how to install **FoodGen** on your iPhone **without publishing to the Apple App Store**.

### Critical iOS Limitation

**iOS does NOT allow installing standalone apps without code signing.** This is a hard limitation imposed by Apple. There is **no way** to generate a free `.ipa` file and install it on a non-jailbroken iPhone without an Apple Developer account ($99/year).

**Why?** Apple requires all iOS apps to be signed with a valid certificate. Without this certificate, the app will not install on your iPhone. This is a security feature built into iOS.

### Important: Expo Free Tier vs Apple Developer Account

These are **two separate things**:

| Service | What It Is | Cost | What It Gives You |
|---------|-----------|------|-------------------|
| **Expo Free Tier** | Expo's cloud build service | Free | 30 builds/month, but iOS builds still need Apple Developer |
| **Apple Developer Account** | Apple's signing certificate | $99/year | Required to sign and install iOS apps |

**Key point**: Even with Expo's free tier (30 builds/month), you **still need** an Apple Developer account ($99/year) to build and install iOS apps. The Expo free tier only covers the cloud build service — Apple's signing requirement is separate.

### What This Means

| Scenario | Can You Do It? | Cost |
|----------|---------------|------|
| Generate a free `.ipa` file and install on iPhone | **No** | N/A |
| Use Expo Go to test on iPhone | **Yes** | Free |
| Use Expo Web to run as a web app | **Yes** | Free |
| Build a real iOS app (EAS Build) | **Yes** | $99/year (Apple Developer) + Free Expo tier |
| Build a free Android APK | **Yes** | Free (Expo free tier) |

---

## 2. Important: iOS Limitations

### Why iOS Is Different from Android

| Feature | Android | iOS |
|---------|---------|-----|
| Install APK directly | Yes | No |
| Install without signing | Yes (with "Unknown Sources") | No |
| Free app distribution | Yes (APK file) | No (requires Apple Developer) |
| Jailbreak required | No | Yes (for unsigned apps) |

### The iOS Signing Requirement

1. **All iOS apps must be signed** with a valid Apple Developer certificate
2. **Without signing**, the app will not install on your iPhone
3. **Apple Developer account** costs $99/year
4. **There is no workaround** for non-jailbroken iPhones

### What About Jailbreaking?

- **Jailbreaking** removes Apple's restrictions and allows installing unsigned apps
- **However**, jailbreaking is:
  - Not recommended (security risks, voids warranty)
  - Not necessary for this project
  - Not covered in this guide

---

## 3. Free Alternatives

Since you cannot install a free `.ipa` file on iPhone, here are the **free alternatives**:

### Option A: Expo Go (Free - Development/Testing)
- **What it is**: A development environment that runs your app on iPhone
- **How it works**: Scan a QR code with your iPhone camera
- **Cost**: Free
- **Limitations**: Not a "real" app, requires your PC to be running

### Option B: Expo Web (Free - Web App)
- **What it is**: A web version of your app that runs in Safari
- **How it works**: Build the web version and host it on a free service
- **Cost**: Free
- **Limitations**: Not a native app, no offline support, no app icon

### Option C: Android APK (Free - Android Only)
- **What it is**: A standalone Android app that can be installed on Android devices
- **How it works**: Build the APK and install it on Android
- **Cost**: Free
- **Limitations**: Android only, not iOS

---

## 4. Option A: Expo Go (Development/Testing)

This is the **simplest** way to test the app on your iPhone. It's not a "real" app installation - it's a development environment that runs your app.

### Steps

```bash
# 1. Navigate to the FoodGen directory
cd FoodGen

# 2. Start the Expo development server
npx expo start

# 3. A QR code will appear in the terminal
# 4. Open the Expo Go app on your iPhone
# 5. Scan the QR code with your iPhone camera
# 6. The app will load on your iPhone
```

### Pros
- No Apple Developer account needed
- No Mac needed
- Free
- Instant hot-reload on code changes

### Cons
- Not a "real" app - it's a development environment
- Requires Expo Go app installed on iPhone
- Requires your PC to be running and on the same network
- No app icon on home screen (it's inside Expo Go)

### When to Use
- During development and testing
- When you want to quickly see changes on your iPhone

---

## 5. Option B: Expo Web (Web App - Free)

This is the **best free option** for personal use. It creates a web version of your app that can be accessed from Safari on your iPhone.

### What It Does
- Builds a web version of your app
- Hosts it on a free service (e.g., Vercel, Netlify, GitHub Pages)
- Accessible from Safari on your iPhone
- No Apple Developer account needed

### Steps

```bash
# 1. Build the web version
cd FoodGen
npx expo export --platform web

# 2. The output will be in the `dist/` directory
# 3. Upload the `dist/` directory to a free hosting service
# 4. Access the URL on your iPhone's Safari browser
```

### Pros
- Free
- No Apple Developer account needed
- No Mac needed
- Accessible from any device with a web browser

### Cons
- Not a native app (no app icon, no offline support)
- Requires internet connection
- Some features may not work (e.g., haptics, camera)
- Not as smooth as a native app

### When to Use
- When you want a free way to use the app on iPhone
- When you don't need native features (haptics, camera, etc.)
- When you want to share the app with others

---

## 6. Option C: Android APK (Free)

This is the **best free option** for Android users. It creates a standalone Android app that can be installed on Android devices.

### What It Does
- Builds a standalone Android APK
- Can be installed on any Android device
- No Google Play Store submission required
- No Apple Developer account needed

### Steps

```bash
# 1. Build the Android APK
cd FoodGen
npx expo build:android

# 2. Download the APK file
# 3. Transfer the APK to your Android device
# 4. Install the APK on your Android device
```

### Pros
- Free
- No Apple Developer account needed
- No Mac needed
- Real app on Android device

### Cons
- Android only, not iOS
- Requires Android device

### When to Use
- When you have an Android device
- When you want a free real app on your device

---

## 7. Paid Option: EAS Build (iOS Real App)

This is the **only way** to get a real iOS app on your iPhone without publishing to the App Store. It requires an Apple Developer account ($99/year).

### What It Does
- Builds a real iOS app using Expo's cloud build service
- Installs on your iPhone via a provisioning profile
- No App Store submission required
- Requires Apple Developer account ($99/year)

### Steps

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Log in to your Expo account
eas login

# 3. Configure EAS Build
eas build:configure

# 4. Build for iOS (ad hoc)
eas build --platform ios --profile production

# 5. Install on iPhone
# - After build completes, you'll get a URL
# - Open the URL on your iPhone
# - Install the app
```

### Pros
- Real app on iPhone
- No Mac needed
- App icon on home screen
- No App Store submission required

### Cons
- Requires Apple Developer account ($99/year)
- Build takes 10-30 minutes
- Limited to 30 builds/month on free tier

---

## 8. Step-by-Step: EAS Build Setup

This section provides a detailed step-by-step guide for setting up EAS Build.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Log in to Expo

```bash
eas login
```

If you don't have an Expo account, create one at [expo.dev](https://expo.dev).

### Step 3: Configure EAS Build

```bash
cd FoodGen
eas build:configure
```

This will create an `eas.json` file in your project directory.

### Step 4: Update `eas.json` for Ad Hoc Distribution

Edit the `eas.json` file to include the following configuration:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "internal"
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 5: Build the App

```bash
# For development build (with hot-reload)
eas build --platform ios --profile development

# For preview build (testing)
eas build --platform ios --profile preview

# For production build (personal use)
eas build --platform ios --profile production
```

### Step 6: Wait for Build to Complete

The build will take 10-30 minutes. You'll receive a notification when it's done.

### Step 7: Install on iPhone

After the build completes, you'll get a URL. Open this URL on your iPhone to install the app.

---

## 9. Installing the Built App on iPhone

### Method 1: Direct Install via URL

1. After the build completes, you'll receive a URL (e.g., `https://expo.dev/artifacts/eas/...`)
2. Open this URL on your iPhone's Safari browser
3. Tap "Install" when prompted
4. The app will be installed on your iPhone

### Method 2: Install via TestFlight (If Using Ad Hoc Distribution)

1. After the build completes, you'll receive a URL
2. Open this URL on your iPhone's Safari browser
3. Tap "Install" when prompted
4. The app will be installed on your iPhone

### Method 3: Install via USB (Development Build)

1. Connect your iPhone to your PC via USB
2. Run the following command:
   ```bash
   eas build --platform ios --profile development --device
   ```
3. The app will be installed on your iPhone

---

## 10. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check your `eas.json` configuration. Ensure all dependencies are installed. |
| App won't install on iPhone | Ensure your iPhone is registered with your Apple Developer account. |
| App crashes on launch | Check the console logs for errors. Ensure all dependencies are installed. |
| Build takes too long | This is normal. EAS Build can take 10-30 minutes. |
| QR code doesn't work | Ensure you're on the same Wi-Fi network as your PC. |
| Expo Go app not found | Download it from the App Store. |

### Debugging Tips

1. **Check the build logs**: After the build completes, check the logs for any errors.
2. **Check the console**: Use `npx expo start` to see the console output.
3. **Check the iPhone**: Ensure your iPhone is connected to the same Wi-Fi network as your PC.
4. **Check the provisioning profile**: Ensure your iPhone is registered with your Apple Developer account.

---

## 11. Cost Summary

| Item | Cost | Notes |
|------|------|-------|
| Expo Go | **Free** | Development/testing only |
| Expo Web | **Free** | Web app, no native features |
| Android APK | **Free** | Android only |
| EAS Build (Free Tier) | **Free** | 30 builds/month |
| EAS Build (Paid Tier) | **$20/month** | Unlimited builds |
| Apple Developer Program | **$99/year** | Required for EAS Build |
| Total (Free Tier) | **$99/year** | Apple Developer Program only |
| Total (Paid Tier) | **$99/year + $20/month** | Apple Developer Program + EAS Build |

---

## 12. Comparison Table

| Feature | Expo Go | Expo Web | Android APK | EAS Build |
|---------|---------|----------|-------------|-----------|
| Real App on iPhone | No | No | No (Android only) | Yes |
| Hot Reload | Yes | No | No | No |
| App Icon | No | No | Yes | Yes |
| Apple Developer Account | No | No | No | Yes |
| Mac Required | No | No | No | No |
| Cost | Free | Free | Free | $99/year |
| Best For | Development | Personal Use (Web) | Android Users | iOS Users |

---

## Quick Reference

### For Development (No Apple Developer Account)

```bash
# Start Expo Go
cd FoodGen
npx expo start

# Scan QR code with iPhone
```

### For Personal Use (Free - Web App)

```bash
# Build web version
cd FoodGen
npx expo export --platform web

# Upload to free hosting service (Vercel, Netlify, GitHub Pages)
# Access URL on iPhone Safari
```

### For Personal Use (Paid - iOS Real App)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Configure EAS Build
cd FoodGen
eas build:configure

# Build for iOS (ad hoc)
eas build --platform ios --profile production

# Install on iPhone
# - Open the URL on your iPhone
# - Tap "Install"
```

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Apple Developer Program](https://developer.apple.com/programs/)
- [Expo Go App](https://expo.dev/go)
- [EAS CLI Documentation](https://docs.expo.dev/eas/)

---

*Last updated: June 15, 2026*
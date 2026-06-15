# FoodGen — iPhone Installation Guide (Without App Store)

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Option A: Expo Go (Development/Testing)](#3-option-a-expo-go-developmenttesting)
4. [Option B: EAS Build — Development Build (Recommended)](#4-option-b-eas-build--development-build-recommended)
5. [Option C: EAS Build — Preview Build (Testing)](#5-option-c-eas-build--preview-build-testing)
6. [Option D: EAS Build — Ad Hoc Distribution (Personal Use)](#6-option-d-eas-build--ad-hoc-distribution-personal-use)
7. [Step-by-Step: EAS Build Setup](#7-step-by-step-eas-build-setup)
8. [Installing the Built App on iPhone](#8-installing-the-built-app-on-iphone)
9. [Troubleshooting](#9-troubleshooting)
10. [Cost Summary](#10-cost-summary)
11. [Comparison Table](#11-comparison-table)

---

## 1. Overview

This guide explains how to install **FoodGen** on your iPhone **without publishing to the Apple App Store**. There are several approaches, each with different trade-offs:

| Approach | Apple Developer Account? | Mac Required? | Real App on iPhone? | Best For |
|----------|--------------------------|---------------|---------------------|----------|
| **Expo Go** | ❌ No | ❌ No | ❌ No (dev environment) | Development & testing |
| **EAS Development Build** | ✅ Yes ($99/year) | ❌ No | ✅ Yes | Daily development |
| **EAS Preview Build** | ✅ Yes ($99/year) | ❌ No | ✅ Yes | Testing & sharing |
| **EAS Ad Hoc Distribution** | ✅ Yes ($99/year) | ❌ No | ✅ Yes | Personal use (no App Store) |

**Recommended approach for personal use:** Option D (Ad Hoc Distribution) — this gives you a real app on your iPhone without App Store submission.

---

## 2. Prerequisites

### For All Options

| Requirement | Details |
|-------------|---------|
| **Windows PC** | Windows 10/11 (already have) |
| **Node.js** | v18+ (already installed) |
| **Expo CLI** | `npm install -g expo-cli` |
| **EAS CLI** | `npm install -g eas-cli` |
| **iPhone** | iOS 15+ (your physical device) |
| **USB Cable** | Lightning or USB-C (for development builds) |
| **Wi-Fi Network** | Same network as your PC (for Expo Go) |

### For Options B, C, D (EAS Build)

| Requirement | Details |
|-------------|---------|
| **Apple Developer Account** | $99/year — [developer.apple.com](https://developer.apple.com) |
| **Apple ID** | Your personal Apple ID |
| **Xcode** | Not required — EAS Build handles compilation in the cloud |
| **Mac** | Not required — EAS Build is cloud-based |

---

## 3. Option A: Expo Go (Development/Testing)

This is the **simplest** way to test the app on your iPhone. It's not a "real" app installation — it's a development environment that runs your app.

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
- ✅ No Apple Developer account needed
- ✅ No Mac needed
- ✅ Free
- ✅ Instant hot-reload on code changes

### Cons
- ❌ Not a "real" app — it's a development environment
- ❌ Requires Expo Go app installed on iPhone
- ❌ Requires your PC to be running and on the same network
- ❌ No app icon on home screen (it's inside Expo Go)

### When to Use
- During development and testing
- When you want to quickly see changes on your iPhone

---

## 4. Option B: EAS Build — Development Build (Recommended)

This creates a **real iOS app** that you can install on your iPhone. It's the best option for daily development.

### What It Does
- Builds a real iOS app using Expo's cloud build service
- Installs on your iPhone via a provisioning profile
- Supports hot-reload (like Expo Go) but as a real app
- Requires Apple Developer account ($99/year)

### Steps

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Log in to your Expo account
eas login

# 3. Configure EAS Build
eas build:configure

# 4. Build for iOS (development)
eas build --platform ios --profile development

# 5. Install on iPhone
# - After build completes, you'll get a URL
# - Open the URL on your iPhone
# - Install the app
```

### Pros
- ✅ Real app on iPhone
- ✅ No Mac needed
- ✅ Hot-reload support
- ✅ App icon on home screen

### Cons
- ❌ Requires Apple Developer account ($99/year)
- ❌ Build takes 10-30 minutes
- ❌ Limited to 30 builds/month on free tier

---

## 5. Option C: EAS Build — Preview Build (Testing)

This creates a **real iOS app** for testing purposes. It's similar to Option B but without hot-reload.

### What It Does
- Builds a real iOS app using Expo's cloud build service
- Installs on your iPhone via a provisioning profile
- No hot-reload — it's a standalone app
- Requires Apple Developer account ($99/year)

### Steps

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Log in to your Expo account
eas login

# 3. Configure EAS Build
eas build:configure

# 4. Build for iOS (preview)
eas build --platform ios --profile preview

# 5. Install on iPhone
# - After build completes, you'll get a URL
# - Open the URL on your iPhone
# - Install the app
```

### Pros
- ✅ Real app on iPhone
- ✅ No Mac needed
- ✅ App icon on home screen
- ✅ Good for sharing with testers

### Cons
- ❌ Requires Apple Developer account ($99/year)
- ❌ No hot-reload
- ❌ Build takes 10-30 minutes

---

## 6. Option D: EAS Build — Ad Hoc Distribution (Personal Use)

This is the **best option for personal use** — it creates a real app that you can install on your iPhone without App Store submission.

### What It Does
- Builds a real iOS app using Expo's cloud build service
- Installs on your iPhone via a provisioning profile
- No hot-reload — it's a standalone app
- Requires Apple Developer account ($99/year)
- **No App Store submission required**

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
- ✅ Real app on iPhone
- ✅ No Mac needed
- ✅ App icon on home screen
- ✅ No App Store submission required
- ✅ Personal use

### Cons
- ❌ Requires Apple Developer account ($99/year)
- ❌ No hot-reload
- ❌ Build takes 10-30 minutes

---

## 7. Step-by-Step: EAS Build Setup

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

## 8. Installing the Built App on iPhone

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

## 9. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Build fails** | Check your `eas.json` configuration. Ensure all dependencies are installed. |
| **App won't install on iPhone** | Ensure your iPhone is registered with your Apple Developer account. |
| **App crashes on launch** | Check the console logs for errors. Ensure all dependencies are installed. |
| **Build takes too long** | This is normal. EAS Build can take 10-30 minutes. |
| **QR code doesn't work** | Ensure you're on the same Wi-Fi network as your PC. |
| **Expo Go app not found** | Download it from the App Store. |

### Debugging Tips

1. **Check the build logs**: After the build completes, check the logs for any errors.
2. **Check the console**: Use `npx expo start` to see the console output.
3. **Check the iPhone**: Ensure your iPhone is connected to the same Wi-Fi network as your PC.
4. **Check the provisioning profile**: Ensure your iPhone is registered with your Apple Developer account.

---

## 10. Cost Summary

| Item | Cost | Notes |
|------|------|-------|
| **Expo Go** | **Free** | Development/testing only |
| **EAS Build (Free Tier)** | **Free** | 30 builds/month |
| **EAS Build (Paid Tier)** | **$20/month** | Unlimited builds |
| **Apple Developer Program** | **$99/year** | Required for EAS Build |
| **Total (Free Tier)** | **$99/year** | Apple Developer Program only |
| **Total (Paid Tier)** | **$99/year + $20/month** | Apple Developer Program + EAS Build |

---

## 11. Comparison Table

| Feature | Expo Go | EAS Development | EAS Preview | EAS Ad Hoc |
|---------|---------|-----------------|-------------|------------|
| **Real App on iPhone** | ❌ | ✅ | ✅ | ✅ |
| **Hot Reload** | ✅ | ✅ | ❌ | ❌ |
| **App Icon** | ❌ | ✅ | ✅ | ✅ |
| **Apple Developer Account** | ❌ | ✅ | ✅ | ✅ |
| **Mac Required** | ❌ | ❌ | ❌ | ❌ |
| **Cost** | Free | $99/year | $99/year | $99/year |
| **Best For** | Development | Daily Dev | Testing | Personal Use |

---

## Quick Reference

### For Development (No Apple Developer Account)

```bash
# Start Expo Go
cd FoodGen
npx expo start

# Scan QR code with iPhone
```

### For Personal Use (With Apple Developer Account)

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
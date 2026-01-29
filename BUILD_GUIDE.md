# 🚀 UniTrack - Complete Installation & Build Guide

## 📋 Overview

This guide will help you build your UniTrack Android app with ads enabled. Follow these steps carefully.

---

## ⚡ Quick Start (3 Main Steps)

1. **Setup** - Create project and install dependencies (10 minutes)
2. **Copy Files** - Add all your code (15 minutes)
3. **Build** - Create APK with EAS (20 minutes)

**Total Time: ~45 minutes**

---

## 📱 STEP 1: Initial Setup

### 1.1 Install Required Software

**Install Node.js:**
- Download from: https://nodejs.org/
- Install LTS version (20.x or higher)
- Verify: Open terminal/command prompt and run:
  ```bash
  node --version
  npm --version
  ```

**Install Git (Optional but recommended):**
- Download from: https://git-scm.com/
- Follow installation wizard

### 1.2 Install Expo CLI & EAS CLI

Open terminal/command prompt and run:
```bash
npm install -g expo-cli eas-cli
```

Verify installation:
```bash
expo --version
eas --version
```

### 1.3 Create Project Directory

```bash
# Create a folder for your project
mkdir UniTrack
cd UniTrack

# Create Expo project
npx create-expo-app@latest frontend --template blank-typescript

# Navigate to project
cd frontend
```

---

## 📂 STEP 2: Install Dependencies

Run these commands in your `frontend` folder:

```bash
# Core dependencies
npm install expo-router expo-splash-screen

# UI & Navigation
npm install @react-navigation/native react-native-safe-area-context react-native-screens

# Storage & Utilities  
npm install @react-native-async-storage/async-storage
npm install @react-native-community/datetimepicker
npm install date-fns

# AdMob (for ads)
npm install react-native-google-mobile-ads

# Notifications
npm install expo-notifications

# In-app purchases
npm install react-native-iap

# Development tools
npm install --save-dev @types/react @types/react-native
```

---

## 📁 STEP 3: Project Structure Setup

Create the following folder structure:

```
frontend/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── courses.tsx
│   │   ├── absences.tsx
│   │   └── settings.tsx
│   ├── _layout.tsx
│   ├── add-course.tsx
│   ├── edit-course.tsx
│   ├── mark-attendance.tsx
│   └── bulk-attendance.tsx
├── components/
│   ├── BannerAd.tsx
│   ├── SupportCreatorModal.tsx
│   └── ConfirmDialog.tsx
├── i18n/
│   ├── LanguageContext.tsx
│   └── translations.ts
├── services/
│   ├── adService.ts
│   └── notificationService.ts
├── assets/
│   ├── icon.png (your logo)
│   ├── adaptive-icon.png
│   └── splash.png
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

**Create folders:**
```bash
# In frontend directory
mkdir -p app/\(tabs\)
mkdir components
mkdir i18n
mkdir services
mkdir assets
```

**Note:** On Windows, use:
```bash
mkdir app
mkdir "app\(tabs)"
mkdir components
mkdir i18n
mkdir services
mkdir assets
```

---

## 🔧 STEP 4: Configuration Files

I'll provide all files in the next sections. For now, let's prepare the main configs:

### 4.1 Update package.json

Open `frontend/package.json` and ensure you have:

```json
{
  "name": "unitrack",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

---

## 📝 STEP 5: Copy All Code Files

I'll provide all the code in separate sections below. Copy each file exactly as shown.

---

## 🎯 CRITICAL FILES TO COPY

### FILE 1: `app.json`

Create `frontend/app.json`:

```json
{
  "expo": {
    "name": "UniTrack",
    "slug": "unitrack",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "unitrack",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4FC3F7"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.unitrack"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4FC3F7"
      },
      "package": "com.yourcompany.unitrack",
      "edgeToEdgeEnabled": true
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/icon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/splash.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#4FC3F7"
        }
      ],
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-3169738861869070~6596052999",
          "iosAppId": "ca-app-pub-3169738861869070~1729965048"
        }
      ],
      "@react-native-community/datetimepicker",
      "expo-font",
      "expo-web-browser"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### FILE 2: `eas.json`

Create `frontend/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### FILE 3: Download Your Logo

Your logo is at:
```
https://customer-assets.emergentagent.com/job_studyplanner-98/artifacts/5oh3oox7_Untitled%20design.png
```

1. Download this image
2. Save it as `icon.png` in the `assets` folder
3. Copy it twice more:
   - `adaptive-icon.png`
   - `splash.png`

Or use command line:
```bash
cd frontend/assets
curl -o icon.png "https://customer-assets.emergentagent.com/job_studyplanner-98/artifacts/5oh3oox7_Untitled%20design.png"
cp icon.png adaptive-icon.png
cp icon.png splash.png
```

---

## ⚙️ STEP 6: Backend Setup (Important!)

Your app needs a backend API. You have two options:

### Option A: Use Existing Emergent Backend (Temporary)

Replace API URLs in code with:
```
EXPO_PUBLIC_BACKEND_URL=your-emergent-backend-url
```

### Option B: Deploy Your Own Backend

Your backend files are in `/app/backend/`. You'll need to:
1. Deploy to a service like Railway, Render, or Heroku
2. Set up MongoDB database
3. Update API URL in your app

**For now, I recommend Option A to test the build.**

---

## 🏗️ STEP 7: Build Your App

### 7.1 Login to Expo

```bash
cd frontend
eas login
```

Enter your credentials:
- Username: `AugAn05`
- Password: `(s)F4K%P%g.v*qy`

### 7.2 Configure EAS Build

```bash
eas build:configure
```

Select "Android" when prompted.

### 7.3 Build Development APK

```bash
eas build --profile development --platform android
```

This will:
- ✅ Upload your code to Expo servers
- ✅ Build the APK (10-20 minutes)
- ✅ Provide download link

### 7.4 Download & Install

1. Wait for build to complete
2. Click the download link in terminal
3. Transfer APK to your Android phone
4. Enable "Install from unknown sources"
5. Install and open UniTrack!

---

## 📱 STEP 8: Testing Your App

Once installed:
1. Open UniTrack app
2. You should see:
   - ✅ Your logo on splash screen
   - ✅ Banner ad at bottom of Dashboard
   - ✅ Support popup after 3 seconds
   - ✅ All features working

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
cd frontend
rm -rf node_modules
npm install
```

**Error: "Authentication failed"**
```bash
eas logout
eas login
```

**Error: "Project not configured"**
```bash
eas build:configure
```

### App Crashes on Start

- Check if backend URL is set correctly
- Verify all dependencies installed
- Check expo logs: `eas build:list`

### Ads Not Showing

- Development builds use TEST ads (that's correct!)
- Real ads appear only in production builds
- Check AdMob account is active

---

## 📋 Next Steps After Build

1. **Test thoroughly** on your phone
2. **Fix any issues** you find
3. **Build for production**:
   ```bash
   eas build --profile production --platform android
   ```
4. **Submit to Play Store**

---

## 🔐 Security Reminder

**IMPORTANT:** Change your Expo password after building!

Go to: https://expo.dev/settings/security

---

## 📞 Need Help?

If you get stuck:
1. Check Expo documentation: https://docs.expo.dev/
2. EAS Build docs: https://docs.expo.dev/build/introduction/
3. AdMob setup: Check `/app/ADMOB_SETUP_GUIDE.md`

---

## ✅ Checklist

Before building, verify:

- [ ] Node.js installed
- [ ] EAS CLI installed  
- [ ] Project created
- [ ] Dependencies installed
- [ ] All code files copied
- [ ] Logo added to assets
- [ ] app.json configured
- [ ] eas.json created
- [ ] Backend URL set
- [ ] Logged into Expo

If all checked, run:
```bash
eas build --profile development --platform android
```

Good luck! 🚀📱

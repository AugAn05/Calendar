# ⚠️ ADS CURRENTLY DISABLED FOR EXPO GO TESTING

## Current Status

Ads are temporarily disabled to prevent errors in Expo Go. The monetization code is complete and ready - just needs to be enabled when you build the app for production.

## What's Ready

✅ All ad code implemented
✅ Banner ads component
✅ Rewarded video modal  
✅ Ad-free purchase UI in Settings
✅ Complete monetization system

## To Enable Ads (When Building for Production)

### Step 1: Uncomment Ad Code

**File: `/app/frontend/app/_layout.tsx`**
```typescript
// Change from:
// import { initializeAds } from '../services/adService';

// To:
import { initializeAds } from '../services/adService';

// And uncomment the modal:
const SupportCreatorModal = Platform.OS !== 'web' 
  ? require('../components/SupportCreatorModal').default 
  : () => null;

// And in useEffect:
initializeAds();

// And in return:
{Platform.OS !== 'web' && <SupportCreatorModal />}
```

**File: `/app/frontend/app/(tabs)/dashboard.tsx`**
```typescript
// Change from:
// const BannerAd = Platform.OS !== 'web' 
//   ? require('../../components/BannerAd').default 
//   : () => null;

// To:
const BannerAd = Platform.OS !== 'web' 
  ? require('../../components/BannerAd').default 
  : () => null;

// And in return (before </SafeAreaView>):
<BannerAd />
```

### Step 2: Create AdMob Account

1. Go to https://admob.google.com
2. Create account
3. Register your app
4. Create 2 ad units:
   - Banner ad
   - Rewarded ad
5. Copy your Ad Unit IDs

### Step 3: Update Ad IDs

**File: `/app/frontend/services/adService.ts`**
```typescript
export const AD_IDS = {
  banner: __DEV__ 
    ? 'ca-app-pub-3940256099942544/6300978111' // Test
    : 'ca-app-pub-YOUR_ACTUAL_ID/BANNER_ID', // ← Replace this
  
  rewarded: __DEV__
    ? 'ca-app-pub-3940256099942544/5224354917' // Test
    : 'ca-app-pub-YOUR_ACTUAL_ID/REWARDED_ID', // ← Replace this
};
```

**File: `/app/frontend/components/BannerAd.tsx`**
```typescript
const AD_IDS = {
  banner: __DEV__ 
    ? 'ca-app-pub-3940256099942544/6300978111'
    : 'ca-app-pub-YOUR_ACTUAL_ID/BANNER_ID', // ← Replace this
};
```

### Step 4: Update app.json

Add your AdMob App ID:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-YOUR_APP_ID~XXXXXXXXXX",
          "iosAppId": "ca-app-pub-YOUR_APP_ID~XXXXXXXXXX"
        }
      ]
    ]
  }
}
```

### Step 5: Build the App

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for testing
eas build --profile development --platform ios

# Or build for production
eas build --profile production --platform all
```

### Step 6: Test Ads

After installing the build on your device:
- Banner ads will appear at bottom of Dashboard
- Support popup will show after 3 seconds
- Watch ad" feature functional
- Purchase removes all ads

## Why Disabled in Expo Go?

- Expo Go doesn't support all native modules
- AdMob requires native compilation
- This is a platform limitation
- Solution: Build the app (not use Expo Go)

## Complete Guide

See `/app/ADMOB_SETUP_GUIDE.md` for detailed instructions on:
- Creating AdMob account
- Getting Ad Unit IDs
- Setting up in-app purchases
- Building and publishing

## Questions?

If you need help enabling ads or building the app, refer to the setup guide or Expo documentation.

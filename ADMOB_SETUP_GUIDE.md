# 📱 AdMob Integration & Monetization Setup Guide

## 🎯 Overview

Your student calendar app now has a complete monetization system:
- **Banner ads** at bottom of Dashboard screen
- **Support popup** that appears every 24 hours asking users to watch a rewarded ad
- **Ad-free purchase option** in Settings for $2.99 (one-time)

## 🚀 What's Already Implemented

### ✅ Ad System
1. **Banner Ads**: Test banner ads showing on Dashboard
2. **Rewarded Ads**: Popup modal for voluntary ad viewing
3. **Ad-Free Logic**: Hides ads when user purchases ad-free version
4. **Test Mode**: Currently using AdMob test IDs for development

### ✅ In-App Purchase
1. **Settings Screen**: Beautiful UI for purchasing ad-free version
2. **Purchase Flow**: Confirmation dialog → Purchase → Thank you message
3. **Restore Purchase**: Option to restore previous purchases
4. **Ad Removal**: Automatically hides all ads after purchase

## 📋 Required Setup (After Development)

### Step 1: Create Google AdMob Account

1. Go to [https://admob.google.com](https://admob.google.com)
2. Sign in with your Google account
3. Click **"Get Started"**
4. Fill in account details

### Step 2: Register Your App

1. In AdMob dashboard, click **"Apps"** → **"Add App"**
2. Select your platform (Android/iOS)
3. Enter app name: **"Student Calendar"**
4. Click **"Add"**
5. **Copy the App ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`)

### Step 3: Create Ad Units

#### Banner Ad Unit:
1. Click on your app → **"Ad units"** → **"Add Ad Unit"**
2. Select **"Banner"**
3. Name: "Dashboard Banner"
4. Click **"Create Ad Unit"**
5. **Copy the Banner Ad Unit ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY`)

#### Rewarded Ad Unit:
1. Add another ad unit
2. Select **"Rewarded"**
3. Name: "Support Creator"
4. Click **"Create Ad Unit"**
5. **Copy the Rewarded Ad Unit ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ`)

### Step 4: Update Your App Code

Replace the test IDs in `/app/frontend/services/adService.ts`:

```typescript
// Current (Test IDs):
export const AD_IDS = {
  banner: __DEV__ 
    ? 'ca-app-pub-3940256099942544/6300978111' // Test
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your ID here
  
  rewarded: __DEV__
    ? 'ca-app-pub-3940256099942544/5224354917' // Test
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ', // Your ID here
};
```

**Replace with your real IDs:**
```typescript
export const AD_IDS = {
  banner: __DEV__ 
    ? 'ca-app-pub-3940256099942544/6300978111' // Test
    : 'ca-app-pub-1234567890123456/9876543210', // ← Your Banner ID
  
  rewarded: __DEV__
    ? 'ca-app-pub-3940256099942544/5224354917' // Test
    : 'ca-app-pub-1234567890123456/1234567890', // ← Your Rewarded ID
};
```

### Step 5: Update app.json

Add your AdMob App ID to `/app/frontend/app.json`:

```json
{
  "expo": {
    "name": "Student Calendar",
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
        }
      ]
    ]
  }
}
```

### Step 6: Set Up In-App Purchases (Production)

For real in-app purchases, you need to:

#### For Android (Google Play):
1. Go to [Google Play Console](https://play.google.com/console)
2. Create/select your app
3. Go to **"Monetization setup"** → **"In-app products"**
4. Create new product:
   - Product ID: `ad_free_version`
   - Name: "Ad-Free Version"
   - Description: "Remove all ads permanently"
   - Price: $2.99
5. Activate the product

#### For iOS (App Store):
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to **"Features"** → **"In-App Purchases"**
4. Create new purchase:
   - Type: Non-consumable
   - Reference Name: "Ad-Free Version"
   - Product ID: `ad_free_version`
   - Price: $2.99
5. Submit for review

## 🧪 Testing Your Setup

### Test in Development Mode:
- Banner ads will show test ads
- Support popup will appear after 3 seconds (then every 24 hours)
- Purchase button simulates purchase (sets ad-free status locally)

### Test with Real Ads:
1. Build production version with real Ad IDs
2. Add test devices in AdMob console
3. Run app on test device
4. Verify ads load correctly

## 💰 Expected Revenue

### Typical Metrics:
- **Banner CPM**: $0.50 - $3.00 (per 1000 impressions)
- **Rewarded CPM**: $5.00 - $15.00 (per 1000 views)
- **Ad-Free Purchase**: $2.99 one-time (70% = $2.09 after store fees)

### Example with 1000 users:
- 500 users see banner daily × 30 days = 15,000 impressions = $15-$45/month
- 100 users watch rewarded ads = $0.50-$1.50/month
- 50 users purchase ad-free = $104.50 one-time

## 📊 Monitoring

### AdMob Dashboard:
- Real-time earnings
- Ad performance metrics
- Fill rates and eCPM

### App Analytics:
- Track purchase conversions in Settings screen
- Monitor ad-free adoption rate

## 🎨 Current Implementation Details

### Features:
✅ Banner ads on Dashboard (adaptive size)
✅ Rewarded ad popup every 24 hours
✅ Beautiful purchase UI in Settings
✅ Ad-free status persists with AsyncStorage
✅ Test mode with AdMob test IDs
✅ Bilingual support (English/Romanian)

### Files Modified:
- `/app/frontend/services/adService.ts` - Ad management
- `/app/frontend/components/BannerAd.tsx` - Banner component
- `/app/frontend/components/SupportCreatorModal.tsx` - Popup
- `/app/frontend/app/(tabs)/settings.tsx` - Purchase UI
- `/app/frontend/app/(tabs)/dashboard.tsx` - Banner placement
- `/app/frontend/app/_layout.tsx` - Ad initialization

## 🔧 Customization Options

### Change Popup Frequency:
In `/app/frontend/services/adService.ts`, line 51:
```typescript
// Show popup every 24 hours (change to 12, 48, 72, etc.)
return hoursSinceLastPopup >= 24;
```

### Change Purchase Price:
1. Update translations in `/app/frontend/i18n/translations.ts`
2. Update price in app stores
3. Update Settings screen if needed

### Add More Ad Placements:
Import and add `<BannerAd />` to any screen:
```typescript
import BannerAd from '../../components/BannerAd';

// In render:
<BannerAd />
```

## ⚠️ Important Notes

1. **Test Thoroughly**: Always test with test IDs before using real ones
2. **Privacy Policy**: Update privacy policy to mention ads and data collection
3. **GDPR Compliance**: Implement consent forms if targeting EU users
4. **Store Approval**: Ensure ads comply with App Store/Play Store policies
5. **Revenue Timeline**: Earnings typically paid out monthly after $100 threshold

## 🆘 Troubleshooting

**Ads not showing?**
- Check internet connection
- Verify Ad IDs are correct
- Check AdMob account status
- Wait 24 hours after creating ad units

**Purchase not working?**
- In development, it only simulates purchase
- Set up real IAP in app stores for production
- Implement react-native-iap properly for production

## 📞 Support

- AdMob Support: [https://support.google.com/admob](https://support.google.com/admob)
- React Native Google Mobile Ads: [https://docs.page/invertase/react-native-google-mobile-ads](https://docs.page/invertase/react-native-google-mobile-ads)

---

**Your app is now monetization-ready! 🎉**

Follow these steps after creating your AdMob account, and you'll start earning revenue from your student calendar app.

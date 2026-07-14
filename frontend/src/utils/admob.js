import { AdMob } from '@capacitor-community/admob';

export async function initializeAdMob() {
  try {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // optional
      initializeForTesting: true, // true for testing
    });
    console.log("AdMob Initialized");
  } catch (error) {
    console.error("AdMob Initialization Failed:", error);
  }
}

export async function showInterstitialAd() {
  try {
    const options = {
      adId: 'ca-app-pub-3940256099942544/1033173712', // Test Interstitial ID
      isTesting: true
    };
    
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
    return true;
  } catch (error) {
    console.error("AdMob Interstitial Error:", error);
    return false; // Even if it fails, we shouldn't block the user's action
  }
}

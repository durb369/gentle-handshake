

## Google Play Store Readiness Assessment

Your project is **very close** to being ready for Google Play Store release, but there are a few gaps to address. Here's a breakdown:

### What's Already Done
- Capacitor configured with correct app ID (`app.spiritvision.scanner`) and splash screen
- Android permissions reference file created
- Play Store listing copy, keywords, and metadata prepared on `/play-store-listing`
- Privacy Policy published at the correct URL
- PWA configuration in place
- Stripe subscription billing working (Boosted $1/mo, Premium $5/mo)
- All core features functional (Spirit Scanner, Spirit Box, Entity Sketches, Journal, Encyclopedia, Psychic Chat, Tarot, Numerology, Fortune Teller)
- Store assets created (512x512 icon, feature graphic, screenshots)

### What's Missing or Needs Attention

**1. In-App Purchases for Android (Critical)**
Currently, subscriptions go through Stripe web checkout (`window.open(url, "_blank")`). Google Play requires in-app billing for subscriptions sold inside Android apps -- using external payment links violates their policy and will get your app rejected. You need to either:
- Integrate Google Play Billing via RevenueCat (which your monetization memory already references)
- Or remove the subscription flow from the Android build and only offer it via web

**2. Capacitor Config Missing Live Server URL**
Your `capacitor.config.ts` lacks the `server.url` property for hot-reload during development. This is fine for production builds but worth noting for your dev workflow.

**3. No `@capacitor/ios` Package**
Only Android is set up, which is fine if you're targeting Play Store only.

**4. The `/play-store-listing` Route is Accessible in Production**
This developer utility page would be visible to end users. Consider removing it from the production build or gating it behind a dev flag.

**5. OG Image Points to Lovable Default**
The Open Graph image in `index.html` points to `lovable.dev/opengraph-image-p98pqg.png`. Should use your own branded image.

### Build & Submission Steps (For Reference)
Once the above are resolved, the process is:
1. Export to GitHub, clone locally
2. `npm install` → `npm run build` → `npx cap sync android`
3. Open in Android Studio: `npx cap open android`
4. Generate a signed AAB (Android App Bundle)
5. Upload AAB to Google Play Console with your listing assets

### Recommended Plan

| Priority | Task | Effort |
|----------|------|--------|
| **Critical** | Integrate RevenueCat for Google Play Billing to replace Stripe web checkout on Android | Large |
| Medium | Remove or hide `/play-store-listing` route from production builds | Small |
| Medium | Replace default OG image with Spirit Vision branded image | Small |
| Low | Add platform detection to conditionally show Stripe (web) vs Play Billing (Android) | Medium |

The **RevenueCat integration** is the single biggest blocker. Without it, Google will reject the app for using external payment processing. Everything else is ready or minor polish. Want me to start implementing the RevenueCat integration, or would you prefer to handle billing differently?


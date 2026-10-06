import type { CapacitorConfig } from "@capacitor/cli";

// Native shell around the live deployed site — all features, auth and data
// come from the production deployment, so the app always matches the web app.
const config: CapacitorConfig = {
  appId: "za.co.taz.mealmatepartners",
  appName: "MealMate Partners",
  webDir: "public",
  server: {
    url: "https://mealmate-partners.vercel.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;

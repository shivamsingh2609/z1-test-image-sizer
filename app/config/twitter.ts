export const TWITTER_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || "",
  clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
  callbackUrl:
    process.env.NEXT_PUBLIC_TWITTER_CALLBACK_URL ||
    "https://z1-test-image-sizer.vercel.app/api/auth/twitter/callback",
};

export const TWITTER_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || "N2pwM2w3X3ZzUVhrNU5XeWk4WVI6MTpjaQ",
  clientSecret: process.env.TWITTER_CLIENT_SECRET || "xWWn4A3ClWUq1Qe1qygpaTtjS-QLMiJrXPBelh9xKUzyz1mtBG",
  callbackUrl:
    process.env.NEXT_PUBLIC_TWITTER_CALLBACK_URL ||
    "https://z1-test-image-sizer.vercel.app/api/auth/twitter/callback",
};

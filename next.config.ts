import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Required for zustand persist with SSR
  },
  // Allow the app to work without OpenAI key (fallback responses enabled)
  env: {
    NEXT_PUBLIC_APP_NAME: "TDC Matchmaker AI",
  },
};

export default nextConfig;

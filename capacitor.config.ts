import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.b6dd30128d9249d688b709c1dcbd072c",
  appName: "A Lovable project",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    url: "https://b6dd3012-8d92-49d6-88b7-09c1dcbd072c.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
};

export default config;

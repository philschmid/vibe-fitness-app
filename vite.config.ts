import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico",
          "apple-touch-icon.png",
          "masked-icon.svg",
        ],
        manifest: {
          name: "FlexTrack Fitness",
          short_name: "FlexTrack",
          description: "Track your workouts and progress",
          theme_color: "#000000",
          background_color: "#000000",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
      }),
    ],
    define: {},
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
    },
  };
});

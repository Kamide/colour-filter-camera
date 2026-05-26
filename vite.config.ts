import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import typegpu from "unplugin-typegpu/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    typegpu(),
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      // language=file-reference
      includeAssets: ["logo.svg"],
      registerType: "autoUpdate",
      manifest: {
        id: "colour-filter-camera",
        name: "Colour Filter Camera",
        short_name: "Colour Filter Camera",
        description: "Colour Filter Camera",
        icons: [
          {
            // language=file-reference
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            // language=file-reference
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            // language=file-reference
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            // language=file-reference
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rolldownOptions: {
      output: {
        hashCharacters: "base36",
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/]react/,
            },
            {
              name: "typegpu-vendor",
              test: /node_modules[\\/]@?typegpu/,
            },
            {
              name: "vendor",
              test: /node_modules/,
            },
          ],
        },
      },
    },
  },
});

import {
  defineConfig,
  minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  // language=file-reference
  images: ["./public/logo.svg"],
  headLinkOptions: {
    preset: "2023",
  },
  preset: {
    ...preset,
    png: {
      compressionLevel: 9,
      effort: 10,
      palette: false,
    },
    maskable: {
      ...preset.maskable,
      resizeOptions: {
        ...preset.maskable.resizeOptions,
        background: "#fff",
      },
    },
    apple: {
      ...preset.apple,
      resizeOptions: {
        ...preset.apple.resizeOptions,
        background: "#fff",
      },
    },
  },
});

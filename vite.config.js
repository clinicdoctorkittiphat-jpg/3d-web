import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        privacy: resolve(__dirname, "privacy.html"),
        kneePain: resolve(__dirname, "knee-pain.html"),
        kneeOsteoarthritis: resolve(__dirname, "knee-osteoarthritis.html"),
        backPain: resolve(__dirname, "back-pain.html"),
        shoulderPain: resolve(__dirname, "shoulder-pain.html"),
        handNumbnessTriggerFinger: resolve(__dirname, "hand-numbness-trigger-finger.html"),
      },
    },
  },
});

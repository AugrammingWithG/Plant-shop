import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages serves the site under /Plant-shop/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH || "/",
  build: {
    // three.js is loaded lazily for the hero bench and is large on its own.
    chunkSizeWarningLimit: 600,
  },
});

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // three.js is loaded lazily for the hero bench and is large on its own.
    chunkSizeWarningLimit: 600,
  },
});

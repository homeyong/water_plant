import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import nodePolyfills from 'rollup-plugin-polyfill-node';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': JSON.stringify('customValue'),
  },
  optimizeDeps: { // 👈 optimizedeps
    esbuildOptions: {
      target: "esnext",
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      supported: {
        bigint: true
      },
    }
  },
  // base: '/your-sub-directory/',
  build: {
    rollupOptions: {
      plugins: [
        nodePolyfills(), // Include the polyfill for production builds
      ],
    },
    target: ["esnext"], // 👈 build.target
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

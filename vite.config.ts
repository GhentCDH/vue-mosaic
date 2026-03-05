// vite.config.js
import {resolve} from 'path'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'demo',
  plugins: [
    tailwindcss(),
    vue(),
    dts({rollupTypes: false, tsconfigPath: resolve(__dirname, 'tsconfig.app.json')}),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
})
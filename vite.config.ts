import { resolve } from 'path'
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), visualizer()],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/spiro.ts"),
      name: "spiro"
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
})

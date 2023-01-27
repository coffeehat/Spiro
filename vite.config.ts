import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/spiro.ts"),
      name: "spiro"
    },
    // rollupOptions: {
    //   external: ['vue', 'pinia'],
    //   output: {
    //     globals: {
    //       vue: 'Vue'
    //     },
    //     paths: {
    //       vue: 'https://unpkg.com/vue@3/dist/vue.esm-browser.js',
    //       pinia: 'https://cdnjs.cloudflare.com/ajax/libs/pinia/2.0.29/pinia.esm-browser.min.js'
    //     }
    //   }
    // }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
})

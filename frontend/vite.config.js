import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Added this

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Added this
  ],
})
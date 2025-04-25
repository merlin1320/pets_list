import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {allowedHosts: ['4ac0-2601-681-6201-ed20-cc08-960c-3aeb-999.ngrok-free.app']},
})

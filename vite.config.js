import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ATTENTION : Doit être le nom EXACT de ton dépôt GitHub entre deux slashs
  base: '/dashboard-corse-dataviz/', 
})
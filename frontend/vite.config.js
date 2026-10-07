import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The backend only allows CORS from port 5173, so never fall back to another port.
  server: { port: 5173, strictPort: true },
  test: { environment: 'node' },
})

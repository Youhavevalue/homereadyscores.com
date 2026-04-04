import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxy = (env.VITE_API_PROXY || '').replace(/\/$/, '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      ...(apiProxy
        ? {
            proxy: {
              '/api': {
                target: apiProxy,
                changeOrigin: true,
                secure: true,
              },
            },
          }
        : {}),
    },
  }
})

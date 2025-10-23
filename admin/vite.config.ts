import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const adminPort = Number(env.ADMIN_PORT ?? '5173')
  const webPort = Number(env.WEB_PORT ?? '3001')
  const webOrigin = env.WEB_ORIGIN ?? `http://localhost:${webPort}`

  return {
    plugins: [react()],
    server: {
      port: adminPort,
      proxy: {
        '/api': {
          target: webOrigin, // Proxy zu Next.js (web)
          changeOrigin: true,
        },
      },
    },
  }
})


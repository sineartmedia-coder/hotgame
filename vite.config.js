import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/hotgame/',
  plugins: [
    react(),
    {
      name: 'fix-jsx-mime',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.includes('.jsx')) {
            res.setHeader('Content-Type', 'application/javascript');
          }
          next();
        });
      }
    }
  ],
})


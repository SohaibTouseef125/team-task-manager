import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // Preserve cookies and session information
        onProxyRes: (proxyRes, req, res) => {
          // Ensure session cookies are properly forwarded
          const cookies = proxyRes.headers['set-cookie'];
          if (cookies) {
            // Update the cookie attributes for local development
            proxyRes.headers['set-cookie'] = cookies.map(cookie => {
              // Remove SameSite restriction for development
              let modifiedCookie = cookie.replace(/; samesite=\w*/gi, '');
              // Remove Secure flag for HTTP development
              modifiedCookie = modifiedCookie.replace(/; secure/gi, '');
              return modifiedCookie;
            });
          }
        },
      },
    },
  },
})
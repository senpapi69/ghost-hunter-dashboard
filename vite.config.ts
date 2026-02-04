import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/' : '/',
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      'ghost-hunter-dashboard.onrender.com',
      '.onrender.com'
    ],
    proxy: mode === 'development' ? {
      // Proxy webhook requests during development
      // In production, these will be handled by the server
      '/api/webhooks': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // @ts-ignore
        configure: (proxy, options) => {
          proxy.on('error', (err: any, req: any, res: any) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq: any, req: any, res: any) => {
            console.log('Sending request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes: any, req: any, res: any) => {
            console.log('Received response:', proxyRes.statusCode, req.url);
          });
        }
      }
    } : undefined,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

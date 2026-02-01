// vite.config.ts
import { defineConfig } from "file:///Users/hudsondelaforce/Desktop/all/buisness/ghost-hunter-dashboard/node_modules/vite/dist/node/index.js";
import react from "file:///Users/hudsondelaforce/Desktop/all/buisness/ghost-hunter-dashboard/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///Users/hudsondelaforce/Desktop/all/buisness/ghost-hunter-dashboard/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/Users/hudsondelaforce/Desktop/all/buisness/ghost-hunter-dashboard";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: mode === "development" ? {
      // Proxy webhook requests during development
      // In production, these will be handled by the server
      "/api/webhooks": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // @ts-ignore
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Sending request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("Received response:", proxyRes.statusCode, req.url);
          });
        }
      }
    } : void 0
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaHVkc29uZGVsYWZvcmNlL0Rlc2t0b3AvYWxsL2J1aXNuZXNzL2dob3N0LWh1bnRlci1kYXNoYm9hcmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9odWRzb25kZWxhZm9yY2UvRGVza3RvcC9hbGwvYnVpc25lc3MvZ2hvc3QtaHVudGVyLWRhc2hib2FyZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvaHVkc29uZGVsYWZvcmNlL0Rlc2t0b3AvYWxsL2J1aXNuZXNzL2dob3N0LWh1bnRlci1kYXNoYm9hcmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIHByb3h5OiBtb2RlID09PSAnZGV2ZWxvcG1lbnQnID8ge1xuICAgICAgLy8gUHJveHkgd2ViaG9vayByZXF1ZXN0cyBkdXJpbmcgZGV2ZWxvcG1lbnRcbiAgICAgIC8vIEluIHByb2R1Y3Rpb24sIHRoZXNlIHdpbGwgYmUgaGFuZGxlZCBieSB0aGUgc2VydmVyXG4gICAgICAnL2FwaS93ZWJob29rcyc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDgwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBvcHRpb25zKSA9PiB7XG4gICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVycjogYW55LCByZXE6IGFueSwgcmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwcm94eSBlcnJvcicsIGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxOiBhbnksIHJlcTogYW55LCByZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NlbmRpbmcgcmVxdWVzdDonLCByZXEubWV0aG9kLCByZXEudXJsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXM6IGFueSwgcmVxOiBhbnksIHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgcmVzcG9uc2U6JywgcHJveHlSZXMuc3RhdHVzQ29kZSwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IDogdW5kZWZpbmVkLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1gsU0FBUyxvQkFBb0I7QUFDclosT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU8sU0FBUyxnQkFBZ0I7QUFBQTtBQUFBO0FBQUEsTUFHOUIsaUJBQWlCO0FBQUEsUUFDZixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUE7QUFBQSxRQUVkLFdBQVcsQ0FBQyxPQUFPLFlBQVk7QUFDN0IsZ0JBQU0sR0FBRyxTQUFTLENBQUMsS0FBVSxLQUFVLFFBQWE7QUFDbEQsb0JBQVEsSUFBSSxlQUFlLEdBQUc7QUFBQSxVQUNoQyxDQUFDO0FBQ0QsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBZSxLQUFVLFFBQWE7QUFDMUQsb0JBQVEsSUFBSSxvQkFBb0IsSUFBSSxRQUFRLElBQUksR0FBRztBQUFBLFVBQ3JELENBQUM7QUFDRCxnQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFlLEtBQVUsUUFBYTtBQUMxRCxvQkFBUSxJQUFJLHNCQUFzQixTQUFTLFlBQVksSUFBSSxHQUFHO0FBQUEsVUFDaEUsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRixJQUFJO0FBQUEsRUFDTjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQzlFLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=

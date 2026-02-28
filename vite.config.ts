import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        '/supabase-proxy': {
          target: env.VITE_SUPABASE_TARGET_URL || 'https://qwe.jiobase.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/supabase-proxy/, ''),
          secure: false,
          ws: true,
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

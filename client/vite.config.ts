import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const appName = env.VITE_APP_NAME || 'Kadha';
  const appUrl = env.VITE_APP_URL || 'https://kadha.org';

  return {
    plugins: [
      react(),
      tsconfigPaths(),
      {
        name: 'app-html-config',
        transformIndexHtml(html) {
          return html.replaceAll('__APP_NAME__', appName).replaceAll('__APP_URL__', appUrl);
        },
      },
    ],
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    },
    server: {
      port: 3000,
      host: true, // Needed for Docker
      strictPort: true, // Fail if port is in use
    },
  };
});

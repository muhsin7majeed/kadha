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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (id.includes('/@chakra-ui/') || id.includes('/@emotion/')) {
              return 'vendor-chakra';
            }

            if (id.includes('/react-icons/')) {
              return 'vendor-icons';
            }

            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router/') ||
              id.includes('/react-hook-form/')
            ) {
              return 'vendor-react';
            }

            if (id.includes('/@tanstack/react-query/')) {
              return 'vendor-query';
            }

            if (id.includes('/axios/') || id.includes('/dayjs/') || id.includes('/jotai/')) {
              return 'vendor-utils';
            }
          },
        },
      },
    },
  };
});

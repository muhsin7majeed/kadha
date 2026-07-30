import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const getOrigin = (value: string) => value.match(/^https?:\/\/[^/]+/i)?.[0] ?? value.replace(/\/+$/, '');
const resolveUrl = (value: string, origin: string) => {
  if (/^https?:\/\//i.test(value)) return value.replace(/\/+$/, '');

  const path = value.replace(/^\/+|\/+$/g, '');
  return path ? `${origin}/${path}` : origin;
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const appName = env.VITE_APP_NAME || 'Kadha';
  const appUrl = env.VITE_APP_URL || 'https://kadha.org';
  const apiUrl = env.VITE_API_URL || 'http://localhost:5000';
  const appOrigin = getOrigin(appUrl);
  const apiBaseUrl = resolveUrl(apiUrl, appOrigin);
  const networkOnlyUrlPattern = new RegExp(
    `^(?:${escapeRegExp(apiBaseUrl)}(?:/|$)|${escapeRegExp(appOrigin)}/api(?:/|$))`,
  );

  return {
    plugins: [
      react(),
      tsconfigPaths(),
      VitePWA({
        injectRegister: null,
        registerType: 'prompt',
        includeAssets: ['kadha.svg', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: appName,
          short_name: appName,
          description: 'A privacy-conscious movie and TV tracker with private defaults and self-hosting.',
          lang: 'en',
          dir: 'ltr',
          start_url: '/app',
          scope: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#ea580c',
          categories: ['entertainment', 'lifestyle'],
          prefer_related_applications: false,
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api(?:\/|$)/],
          runtimeCaching: [
            {
              urlPattern: networkOnlyUrlPattern,
              handler: 'NetworkOnly',
            },
          ],
        },
      }),
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

            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router/') ||
              id.includes('/react-hook-form/') ||
              id.includes('/@chakra-ui/') ||
              id.includes('/@emotion/') ||
              id.includes('/next-themes/')
            ) {
              return 'vendor-ui';
            }

            if (id.includes('/react-icons/')) {
              return 'vendor-icons';
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

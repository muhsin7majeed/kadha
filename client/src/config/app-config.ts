export const APP_CONFIG = {
  appName: import.meta.env.VITE_APP_NAME || 'Kadha',
  appUrl: import.meta.env.VITE_APP_URL || 'https://kadha.org',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  githubUrl: 'https://github.com/muhsin7majeed/kadha',
  version: import.meta.env.VITE_APP_VERSION || '0.1.0',
} as const;

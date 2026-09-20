const appName = import.meta.env.VITE_APP_NAME || 'Kadha';

export const APP_CONFIG = {
  appName,
  appNameSlug: appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'app',
  appUrl: import.meta.env.VITE_APP_URL || 'https://kadha.org',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  githubUrl: 'https://github.com/muhsin7majeed/kadha',
  version: import.meta.env.VITE_APP_VERSION || '0.0.0',
} as const;

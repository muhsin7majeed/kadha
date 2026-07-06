import type { Express } from 'express';

let app: Express;

export const getTestApp = async () => {
  if (!app) {
    const appModule = await import('@/app');
    app = appModule.createApp();
  }

  return app;
};

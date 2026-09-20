import 'express-async-errors';

import { envConfig, validateEnvVars } from './config/env';
import { createApp } from './app';
import { startMediaMetadataWorker } from './features/media/media-metadata.service';
import { startPushDeliveryWorker } from './features/notification/push.service';

validateEnvVars();

const app = createApp();

app.listen(envConfig.port, '0.0.0.0', () => {
  console.log(`Server is running on port ${envConfig.port}`);
  startMediaMetadataWorker();
  startPushDeliveryWorker();
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection');
});

import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { errorHandler } from '@/middlewares/errorHandler';

describe('Express async route handling', () => {
  it('forwards rejected async routes to the error handler', async () => {
    const app = express();

    app.get('/failure', async () => {
      throw new Error('async failure');
    });
    app.use(errorHandler);

    const response = await request(app).get('/failure').expect(500);

    expect(response.body).toEqual({ message: 'Something went wrong' });
  });
});

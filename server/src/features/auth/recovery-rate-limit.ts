import { createHash } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

import { tooManyRequests } from '@/lib/http';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ACCOUNT_ATTEMPTS = 5;
const MAX_IP_ATTEMPTS = 100;
const MAX_TRACKED_IDENTIFIERS = 10_000;

interface AttemptWindow {
  count: number;
  resetAt: number;
}

const accountAttempts = new Map<string, AttemptWindow>();
const ipAttempts = new Map<string, AttemptWindow>();

const hashIdentifier = (value: string) => createHash('sha256').update(value).digest('hex');

const consumeAttempt = (attempts: Map<string, AttemptWindow>, key: string, maxAttempts: number, now: number) => {
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return null;
  }

  current.count += 1;

  if (current.count <= maxAttempts) {
    return null;
  }

  return current.resetAt;
};

const pruneExpiredAttempts = (attempts: Map<string, AttemptWindow>, now: number) => {
  if (attempts.size < 1_000) {
    return;
  }

  attempts.forEach((attempt, key) => {
    if (attempt.resetAt <= now) {
      attempts.delete(key);
    }
  });

  while (attempts.size >= MAX_TRACKED_IDENTIFIERS) {
    const oldestKey = attempts.keys().next().value;

    if (typeof oldestKey !== 'string') {
      break;
    }

    attempts.delete(oldestKey);
  }
};

export const recoveryRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  const username = typeof req.body?.username === 'string' ? req.body.username.trim().toLowerCase() : '';
  const accountKey = hashIdentifier(username || 'missing-username');
  const ipKey = req.ip || req.socket.remoteAddress || 'unknown-ip';

  pruneExpiredAttempts(accountAttempts, now);
  pruneExpiredAttempts(ipAttempts, now);

  const accountResetAt = consumeAttempt(accountAttempts, accountKey, MAX_ACCOUNT_ATTEMPTS, now);
  const ipResetAt = consumeAttempt(ipAttempts, ipKey, MAX_IP_ATTEMPTS, now);
  const resetAt = Math.max(accountResetAt ?? 0, ipResetAt ?? 0);

  if (resetAt > now) {
    res.setHeader('Retry-After', Math.max(1, Math.ceil((resetAt - now) / 1_000)));
    return next(tooManyRequests('Too many recovery attempts. Try again later.'));
  }

  return next();
};

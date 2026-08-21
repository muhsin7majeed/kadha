import { createHash } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

import { tooManyRequests } from '@/lib/http';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES_PER_ACCOUNT = 5;
const MAX_LOGIN_REQUESTS_PER_IP = 100;
const REGISTRATION_WINDOW_MS = 60 * 60 * 1000;
const MAX_REGISTRATIONS_PER_IP = 10;
const REFRESH_WINDOW_MS = 15 * 60 * 1000;
const MAX_REFRESH_REQUESTS_PER_IP = 120;
const MAX_TRACKED_IDENTIFIERS = 10_000;

interface AttemptWindow {
  count: number;
  resetAt: number;
}

const loginAccountFailures = new Map<string, AttemptWindow>();
const loginIpRequests = new Map<string, AttemptWindow>();
const registrationIpRequests = new Map<string, AttemptWindow>();
const refreshIpRequests = new Map<string, AttemptWindow>();
const sensitiveActionRequests = new Map<string, AttemptWindow>();
const SENSITIVE_ACTION_WINDOW_MS = 15 * 60 * 1000;
const MAX_SENSITIVE_ACTION_REQUESTS = 10;

const hashIdentifier = (value: string) => createHash('sha256').update(value).digest('hex');

const normalizeUsername = (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const getClientIp = (req: Request) => req.ip || req.socket.remoteAddress || 'unknown-ip';

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

const consumeRequest = (
  attempts: Map<string, AttemptWindow>,
  key: string,
  maxAttempts: number,
  windowMs: number,
  now: number,
) => {
  pruneExpiredAttempts(attempts, now);
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= maxAttempts) {
    return current.resetAt;
  }

  current.count += 1;
  return null;
};

const getBlockedUntil = (attempts: Map<string, AttemptWindow>, key: string, maxAttempts: number, now: number) => {
  pruneExpiredAttempts(attempts, now);
  const current = attempts.get(key);

  if (!current || current.resetAt <= now || current.count < maxAttempts) {
    return null;
  }

  return current.resetAt;
};

const rejectRateLimitedRequest = (res: Response, next: NextFunction, resetAt: number, message: string) => {
  const now = Date.now();
  res.setHeader('Retry-After', Math.max(1, Math.ceil((resetAt - now) / 1_000)));
  return next(tooManyRequests(message));
};

export const loginRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  const ipResetAt = consumeRequest(loginIpRequests, getClientIp(req), MAX_LOGIN_REQUESTS_PER_IP, LOGIN_WINDOW_MS, now);
  const username = normalizeUsername(req.body?.username);
  const accountResetAt = username
    ? getBlockedUntil(loginAccountFailures, hashIdentifier(username), MAX_LOGIN_FAILURES_PER_ACCOUNT, now)
    : null;
  const resetAt = Math.max(ipResetAt ?? 0, accountResetAt ?? 0);

  if (resetAt > now) {
    return rejectRateLimitedRequest(res, next, resetAt, 'Too many login attempts. Try again later.');
  }

  return next();
};

export const recordFailedLogin = (username: string) => {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return;
  }

  consumeRequest(
    loginAccountFailures,
    hashIdentifier(normalizedUsername),
    MAX_LOGIN_FAILURES_PER_ACCOUNT,
    LOGIN_WINDOW_MS,
    Date.now(),
  );
};

export const clearFailedLogins = (username: string) => {
  const normalizedUsername = normalizeUsername(username);

  if (normalizedUsername) {
    loginAccountFailures.delete(hashIdentifier(normalizedUsername));
  }
};

const createIpRateLimit = (
  attempts: Map<string, AttemptWindow>,
  maxAttempts: number,
  windowMs: number,
  message: string,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const resetAt = consumeRequest(attempts, getClientIp(req), maxAttempts, windowMs, now);

    if (resetAt) {
      return rejectRateLimitedRequest(res, next, resetAt, message);
    }

    return next();
  };
};

export const registrationRateLimit = createIpRateLimit(
  registrationIpRequests,
  MAX_REGISTRATIONS_PER_IP,
  REGISTRATION_WINDOW_MS,
  'Too many registration attempts. Try again later.',
);

export const refreshRateLimit = createIpRateLimit(
  refreshIpRequests,
  MAX_REFRESH_REQUESTS_PER_IP,
  REFRESH_WINDOW_MS,
  'Too many session refresh attempts. Try again later.',
);

export const sensitiveActionRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  const accountId = req.user?.id ?? 'unauthenticated';
  const key = hashIdentifier(`${accountId}:${getClientIp(req)}`);
  const resetAt = consumeRequest(
    sensitiveActionRequests,
    key,
    MAX_SENSITIVE_ACTION_REQUESTS,
    SENSITIVE_ACTION_WINDOW_MS,
    now,
  );

  if (resetAt) {
    return rejectRateLimitedRequest(res, next, resetAt, 'Too many sensitive account requests. Try again later.');
  }

  return next();
};

export const resetAuthRateLimitsForTests = () => {
  if (process.env.NODE_ENV !== 'test') {
    return;
  }

  loginAccountFailures.clear();
  loginIpRequests.clear();
  registrationIpRequests.clear();
  refreshIpRequests.clear();
  sensitiveActionRequests.clear();
};

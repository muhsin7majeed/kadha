const WINDOW_MS = 15 * 60 * 1000;
const MAX_FILMS_PER_WINDOW = 15_000;
const MAX_CONCURRENT_REQUESTS = 4;

interface WorkWindow {
  films: number;
  resetAt: number;
  active: boolean;
}

const windows = new Map<string, WorkWindow>();
let activeRequests = 0;
let activeImports = 0;

export const reserveLetterboxdWork = (userId: string, films: number, writing = false): { release: () => void } | { retryAfter: number } => {
  const now = Date.now();
  if (windows.size > 1000) {
    for (const [id, window] of windows) {
      if (!window.active && window.resetAt <= now) windows.delete(id);
    }
  }
  const previous = windows.get(userId);
  if (previous?.active || activeRequests >= MAX_CONCURRENT_REQUESTS || (writing && activeImports > 0)) {
    return { retryAfter: 1 };
  }
  const window = previous && previous.resetAt > now ? previous : { films: 0, resetAt: now + WINDOW_MS, active: false };
  if (window.films + films > MAX_FILMS_PER_WINDOW) {
    return { retryAfter: Math.max(1, Math.ceil((window.resetAt - now) / 1000)) };
  }
  window.films += films;
  window.active = true;
  windows.set(userId, window);
  activeRequests += 1;
  if (writing) activeImports += 1;
  return {
    release: () => {
      window.active = false;
      activeRequests -= 1;
      if (writing) activeImports -= 1;
    },
  };
};

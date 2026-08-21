import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from 'playwright';

const appUrl = process.env.KADHA_DEMO_APP_URL ?? 'http://client:3000';
const apiUrl = process.env.KADHA_DEMO_API_URL ?? 'http://server:5000';
const outputDir = resolve('output');
const rawVideoPath = resolve(outputDir, 'kadha-raw.webm');
const timelinePath = resolve(outputDir, 'timeline.json');
const sceneMinimumDurationMs = 8_000;

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

const waitForUrl = async (url) => {
  const deadline = Date.now() + 120_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3_000) });
      if (response.ok) return;
    } catch {
      // The app containers may still be starting or seeding the disposable database.
    }

    await sleep(1_000);
  }

  throw new Error(`Kadha did not become ready at ${url}`);
};

await mkdir(outputDir, { recursive: true });
await Promise.all([waitForUrl(appUrl), waitForUrl(`${apiUrl}/health`)]);

const browser = await chromium.launch({
  headless: true,
  args: ['--hide-scrollbars'],
});

const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  colorScheme: 'dark',
  deviceScaleFactor: 1,
  recordVideo: {
    dir: outputDir,
    size: { width: 1600, height: 900 },
  },
});

const page = await context.newPage();
const video = page.video();
const captureStartedAt = Date.now();
const scenes = [];

const waitForArtwork = async () => {
  await page
    .waitForFunction(
      () => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
      undefined,
      { timeout: 20_000 },
    )
    .catch(() => undefined);
};

const installCursor = async () => {
  await page.evaluate(() => {
    if (document.querySelector('[data-demo-cursor]')) return;

    const cursor = document.createElement('div');
    cursor.dataset.demoCursor = 'true';
    cursor.innerHTML = '<span></span>';
    document.body.append(cursor);

    const style = document.createElement('style');
    style.textContent = `
      [data-demo-cursor] {
        position: fixed;
        left: 0;
        top: 0;
        width: 20px;
        height: 20px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid rgba(0, 0, 0, 0.36);
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.38);
        pointer-events: none;
        transform: translate3d(60px, 60px, 0);
        transition: transform 600ms cubic-bezier(.22, 1, .36, 1);
        z-index: 2147483647;
      }
      [data-demo-cursor]::after {
        content: '';
        position: absolute;
        inset: -10px;
        border: 2px solid rgba(255, 132, 43, 0.72);
        border-radius: inherit;
        opacity: 0;
        transform: scale(0.55);
      }
      [data-demo-cursor][data-clicking='true']::after {
        animation: demo-click 520ms cubic-bezier(.22, 1, .36, 1);
      }
      @keyframes demo-click {
        0% { opacity: .9; transform: scale(.55); }
        100% { opacity: 0; transform: scale(1.3); }
      }
    `;
    document.head.append(style);

    window.__kadhaDemoCursor = {
      move(x, y) {
        cursor.style.transform = `translate3d(${x - 6}px, ${y - 4}px, 0)`;
      },
      click() {
        cursor.dataset.clicking = 'false';
        void cursor.offsetWidth;
        cursor.dataset.clicking = 'true';
        window.setTimeout(() => {
          cursor.dataset.clicking = 'false';
        }, 540);
      },
    };
  });
};

const moveTo = async (locator) => {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error('Unable to locate demo target');

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.evaluate(({ x: nextX, y: nextY }) => window.__kadhaDemoCursor?.move(nextX, nextY), { x, y });
  await page.mouse.move(x, y, { steps: 24 });
  await sleep(680);
};

const click = async (locator) => {
  await moveTo(locator);
  await page.evaluate(() => window.__kadhaDemoCursor?.click());
  await locator.click();
  await sleep(500);
};

const runScene = async (id, title, action) => {
  const sceneStartedAt = Date.now();
  await action();
  const elapsed = Date.now() - sceneStartedAt;
  if (elapsed < sceneMinimumDurationMs) await sleep(sceneMinimumDurationMs - elapsed);

  scenes.push({
    id,
    title,
    start: (sceneStartedAt - captureStartedAt) / 1000,
    end: (Date.now() - captureStartedAt) / 1000,
  });
};

try {
  await page.goto(`${appUrl}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.getByRole('heading', { name: 'Log in to your account' }).waitFor({ timeout: 120_000 });
  await installCursor();

  await page.getByLabel('Username').fill('filmlover');
  await page.locator('input[name="password"]').fill('KadhaDemo2026!');
  await click(page.getByRole('button', { name: 'Login' }));
  await page.waitForURL('**/app', { timeout: 30_000 });
  await page.getByText('Trending Movies').waitFor({ timeout: 30_000 });
  await waitForArtwork();
  await installCursor();
  await sleep(1_000);

  await runScene('discover', 'Discover what moves you.', async () => {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await sleep(1_200);
    await page.evaluate(() => window.scrollTo({ top: 430, behavior: 'smooth' }));
    await sleep(2_800);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await sleep(2_000);
  });

  await runScene('track', 'Remember every detail.', async () => {
    await click(page.getByRole('button', { name: 'Search', exact: true }));
    const searchInput = page.getByRole('textbox', { name: 'Search' });
    await searchInput.pressSequentially('Interstellar', { delay: 85 });
    const result = page.getByRole('link', { name: /Interstellar \(2014\)/ }).first();
    await result.waitFor({ timeout: 20_000 });
    await waitForArtwork();
    await sleep(1_000);
    await click(result);
    await page.waitForURL('**/app/media/movie/157336', { timeout: 30_000 });
    await page.getByRole('heading', { name: /Interstellar/ }).waitFor({ timeout: 30_000 });
    await waitForArtwork();
    await sleep(1_600);
    await click(page.getByRole('button', { name: 'Like' }).first());
    await sleep(1_200);
  });

  await page.keyboard.press('Escape');
  await sleep(500);

  await runScene('progress', 'Always know what’s next.', async () => {
    await click(page.getByRole('link', { name: 'Progress' }));
    await page.getByRole('heading', { name: 'In Progress', exact: true }).waitFor({ timeout: 30_000 });
    await waitForArtwork();
    await sleep(2_000);
    const markNext = page.getByRole('button', { name: 'Mark next' }).first();
    if (await markNext.isVisible()) {
      await moveTo(markNext);
      await sleep(1_500);
    }
  });

  await runScene('collections', 'Make every list personal.', async () => {
    await click(page.getByRole('link', { name: 'Collections' }));
    await page.getByRole('heading', { name: 'Collections' }).waitFor({ timeout: 30_000 });
    const collection = page.getByText('Modern masterpieces', { exact: true });
    await collection.waitFor({ timeout: 20_000 });
    await click(collection);
    await waitForArtwork();
    await sleep(3_000);
    await page.evaluate(() => window.scrollTo({ top: 260, behavior: 'smooth' }));
    await sleep(2_000);
  });

  await runScene('privacy', 'Private by default. Yours by design.', async () => {
    await page.evaluate(() => {
      window.history.pushState({}, '', '/app/settings/privacy');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.getByRole('heading', { name: 'Settings' }).waitFor({ timeout: 30_000 });
    await page.getByRole('heading', { name: 'Visibility' }).waitFor({ timeout: 30_000 });
    await sleep(2_000);
    await page.evaluate(() => window.scrollTo({ top: 280, behavior: 'smooth' }));
    await sleep(2_500);
    const friendsOption = page.getByText('Friends', { exact: true }).first();
    if (await friendsOption.isVisible()) await moveTo(friendsOption);
  });

  await writeFile(
    timelinePath,
    `${JSON.stringify({ width: 1600, height: 900, scenes }, null, 2)}\n`,
    'utf8',
  );

  await page.close();
  await video.saveAs(rawVideoPath);
} finally {
  await context.close();
  await browser.close();
}

console.log(`Saved raw capture to ${rawVideoPath}`);
console.log(`Saved scene timeline to ${timelinePath}`);

import { expect, test, type Page } from '@playwright/test';

interface MatchResult {
  actualLength: number;
  actualPrefix: string;
  expectedLength: number;
  expectedPrefix: string;
  matches: boolean;
}

interface BrowserFixture {
  compressArrayBufferMatches(
    inputName: string,
    expectedName: string
  ): Promise<MatchResult>;
  compressMatches(
    inputName: string,
    expectedName: string
  ): Promise<MatchResult>;
  concurrentCallsMatch(): Promise<MatchResult[]>;
  decompressArrayBufferMatches(
    inputName: string,
    expectedName: string
  ): Promise<MatchResult>;
  decompressMatches(
    inputName: string,
    expectedName: string
  ): Promise<MatchResult>;
  repeatedCallsMatch(): Promise<MatchResult[]>;
  subpathDecompressMatches(
    inputName: string,
    expectedName: string
  ): Promise<MatchResult>;
}

declare global {
  interface Window {
    woff2E2E: BrowserFixture;
  }
}

/**
 * Opens the browser fixture page.
 *
 * @param page - The Playwright page.
 * @returns A promise that resolves after the page is ready.
 */
async function openFixture(page: Page): Promise<void> {
  await page.goto('/tests/e2e/fixtures/index.html');
  await expect(page.locator('body')).toHaveAttribute('data-status', 'ready');
}

/**
 * Asserts that browser output exactly matched the expected fixture.
 *
 * @param result - The browser comparison result.
 * @returns Nothing.
 */
function expectMatch(result: MatchResult): void {
  expect(result.matches).toBe(true);
  expect(result.actualLength).toBe(result.expectedLength);
  expect(result.actualPrefix).toBe(result.expectedPrefix);
}

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test('compress loads wasm and returns WOFF2 data', async ({ page }) => {
  const result = await page.evaluate(() =>
    window.woff2E2E.compressMatches('og.ttf', 'enc-ttf.woff2')
  );

  expectMatch(result);
});

test('compress accepts ArrayBuffer input in the browser', async ({ page }) => {
  const result = await page.evaluate(() =>
    window.woff2E2E.compressArrayBufferMatches('og.ttf', 'enc-ttf.woff2')
  );

  expectMatch(result);
});

test('root decompress loads wasm and returns SFNT data', async ({ page }) => {
  const result = await page.evaluate(() =>
    window.woff2E2E.decompressMatches('og.woff2', 'dec-woff2.ttf')
  );

  expectMatch(result);
});

test('root decompress accepts ArrayBuffer input in the browser', async ({
  page,
}) => {
  const result = await page.evaluate(() =>
    window.woff2E2E.decompressArrayBufferMatches('og.woff2', 'dec-woff2.ttf')
  );

  expectMatch(result);
});

test('subpath decompress export works in the browser', async ({ page }) => {
  const result = await page.evaluate(() =>
    window.woff2E2E.subpathDecompressMatches('og.woff2', 'dec-woff2.ttf')
  );

  expectMatch(result);
});

test('repeated calls reuse initialized modules', async ({ page }) => {
  const results = await page.evaluate(() =>
    window.woff2E2E.repeatedCallsMatch()
  );

  expect(results).toHaveLength(4);
  for (const result of results) {
    expectMatch(result);
  }
});

test('concurrent calls do not race module initialization', async ({ page }) => {
  const results = await page.evaluate(() =>
    window.woff2E2E.concurrentCallsMatch()
  );

  expect(results).toHaveLength(8);
  for (const result of results) {
    expectMatch(result);
  }
});

test('reload can initialize and call the modules again', async ({ page }) => {
  expectMatch(
    await page.evaluate(() =>
      window.woff2E2E.compressMatches('og.ttf', 'enc-ttf.woff2')
    )
  );

  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-status', 'ready');

  expectMatch(
    await page.evaluate(() =>
      window.woff2E2E.decompressMatches('og.woff2', 'dec-woff2.ttf')
    )
  );
});

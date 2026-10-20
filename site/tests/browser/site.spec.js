import { test, expect } from '@playwright/test';
import { pages, pagePath } from '../../src/routes';

async function loadPhotographs(page) {
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

test('all pages hydrate, navigation works, and layouts fit the viewport', async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat|React|Minified/.test(message.text()))
      errors.push(message.text());
  });
  for (const [key, metadata] of Object.entries(pages)) {
    const response = await page.goto(pagePath(key));
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(`${metadata.title} | Culture Exteriors`);
    await expect(page.locator('main h1')).toBeVisible();
    await loadPhotographs(page);
    if (['siding', 'roofing', 'windows', 'gutters'].includes(key)) {
      await page.screenshot({
        path: testInfo.outputPath(`${key}.png`),
        fullPage: true,
        animations: 'disabled',
      });
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    if (testInfo.project.name === 'mobile')
      await page.getByRole('button', { name: 'Menu ☰' }).click();
    for (const service of ['siding', 'roofing', 'windows', 'gutters']) {
      const toggle = page.getByRole('button', { name: `Show ${service} topics` });
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator(`#nav-${service} a`).first()).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(toggle).toBeFocused();
    }
    if (testInfo.project.name === 'mobile') await page.keyboard.press('Escape');
  }
  await page.goto('/not-a-real-page/');
  await expect(page.locator('main h1')).toHaveText('That page isn’t here.');
  expect(errors).toEqual([]);
});

test('gallery filters, FAQs, contact validation and draft-only email work', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await loadPhotographs(page);
  await page.screenshot({
    path: testInfo.outputPath('homepage-viewport.png'),
    animations: 'disabled',
  });
  await page.screenshot({
    path: testInfo.outputPath('homepage.png'),
    fullPage: true,
    animations: 'disabled',
  });
  for (const label of ['Siding', 'Roofing', 'Windows', 'Gutters']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.locator('.gallery figure:visible')).toHaveCount(1);
    await expect(page.locator('#gallery-status')).toHaveText(
      `Showing 1 ${label.toLowerCase()} image`,
    );
  }
  await page.getByRole('button', { name: 'All details' }).click();
  await expect(page.locator('.gallery figure:visible')).toHaveCount(4);
  const question = page.locator('.faq summary').first();
  await question.click();
  await expect(page.locator('.faq[open]')).toHaveCount(1);
  await page.getByRole('link', { name: 'Request an Estimate', exact: true }).first().click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await expect(
    page.getByRole('link', { name: 'info@cultureexteriors.com' }).first(),
  ).toHaveAttribute('href', 'mailto:info@cultureexteriors.com');
  await page.screenshot({
    path: testInfo.outputPath('contact.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: /Prepare Email Request/ }).click();
  await expect(page.getByLabel('Full name')).toBeFocused();
  await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Full name').fill('Preview Homeowner');
  await page.getByLabel('Email', { exact: true }).fill('preview@example.com');
  await page.getByLabel('City', { exact: true }).fill('Columbus');
  await page.getByLabel('ZIP / postal code').fill('43215');
  await page.getByLabel('Siding', { exact: true }).check();
  await page.getByLabel('Windows', { exact: true }).check();
  await page
    .getByLabel('Tell us about your project')
    .fill('Planning siding and window improvements.');
  await page.getByRole('button', { name: /Prepare Email Request/ }).click();
  await expect(page.getByRole('status')).toContainText('Nothing has been sent');
  await expect(page.getByRole('link', { name: /Open your email draft/ })).toHaveAttribute(
    'href',
    /^mailto:info@cultureexteriors.com/,
  );
  await expect(page.getByRole('link', { name: /Open your email draft/ })).toBeFocused();
});

test('pre-rendered service content works without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/siding/`);
  await expect(page.locator('main h1')).toContainText('Siding that suits');
  await expect(page.getByRole('table')).toBeVisible();
  await page.getByRole('link', { name: 'Request an Estimate', exact: true }).first().click();
  await expect(page.locator('#estimate-form')).toBeVisible();
  await context.close();
});

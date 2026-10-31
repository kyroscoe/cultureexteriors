import { test, expect } from '@playwright/test';
import { pages, pagePath } from '../../src/routes';

async function loadPhotographs(page) {
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

test('all pages hydrate, header stays simple, and layouts fit the viewport', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat|React|Minified/.test(message.text()))
      errors.push(message.text());
  });
  for (const [key, metadata] of Object.entries(pages)) {
    const response = await page.goto(pagePath(key));
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(`${metadata.title} | Culture Homes & Exteriors`);
    await expect(page.locator('main h1')).toBeVisible();
    await loadPhotographs(page);

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const header = page.locator('header');
    await expect(header.locator('nav, button')).toHaveCount(0);
    await expect(header.getByRole('link', { name: 'Request an Estimate' })).toBeVisible();
  }
  await page.goto('/not-a-real-page/');
  await expect(page.locator('main h1')).toHaveText('That page isn’t here.');
  expect(errors).toEqual([]);
});

test('homepage FAQs, contact validation and Netlify submission work', async ({
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
  await expect(page.locator('.reference-section, .gallery, .dropdown')).toHaveCount(0);
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
  await page.getByRole('button', { name: /Send Estimate Request/ }).click();
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
  await page.route(`${new URL(page.url()).origin}/`, async (route) => {
    const request = route.request();
    expect(request.method()).toBe('POST');
    expect(request.headers()['content-type']).toBe('application/x-www-form-urlencoded');
    const body = new URLSearchParams(request.postData());
    expect(body.get('form-name')).toBe('estimate');
    expect(body.getAll('services[]')).toEqual(['Siding', 'Windows']);
    expect(body.get('website')).toBe('');
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<html>Accepted</html>' });
  });
  await page.getByRole('button', { name: /Send Estimate Request/ }).click();
  await expect(page.getByRole('status')).toContainText('request has been received');
  await expect(page.getByLabel('Full name')).toHaveValue('');
  await expect(page.getByRole('status')).toBeFocused();
});

test('a local preview cannot claim successful delivery', async ({ page }) => {
  await page.goto('/contact/');
  await page.getByLabel('Full name').fill('Local Preview');
  await page.getByLabel('Email', { exact: true }).fill('preview@example.com');
  await page.getByLabel('City', { exact: true }).fill('Columbus');
  await page.getByLabel('ZIP / postal code').fill('43215');
  await page.getByLabel('Siding', { exact: true }).check();
  await page
    .getByLabel('Tell us about your project')
    .fill('Checking a local form, without sending an inquiry.');
  await page.getByRole('button', { name: /Send Estimate Request/ }).click();
  await expect(page.getByRole('status')).toContainText('local preview cannot submit');
  await expect(page.getByRole('status')).toHaveClass(/error/);
  await expect(page.getByLabel('Full name')).toHaveValue('Local Preview');
  await expect(page.getByRole('button', { name: /Send Estimate Request/ })).toBeEnabled();
});

test('pre-rendered homepage and contact work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/`);
  await expect(page.locator('main h1')).toContainText('Built to Protect.');
  await expect(page.locator('#services')).toBeVisible();
  await page.getByRole('link', { name: 'Request an Estimate', exact: true }).first().click();
  await expect(page.locator('#estimate-form')).toBeVisible();
  await context.close();
});

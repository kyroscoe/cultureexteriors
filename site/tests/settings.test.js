import { describe, expect, it } from 'vitest';
import { siteOrigin, shouldIndex } from '../scripts/settings.mjs';
import { pagePath, routeKey } from '../src/routes';

describe('deployment settings and routes', () => {
  it('uses the Netlify production origin or an explicit custom domain', () => {
    expect(
      siteOrigin({ NETLIFY: 'true', CONTEXT: 'production', URL: 'https://project.netlify.app' }),
    ).toBe('https://project.netlify.app');
    expect(
      siteOrigin({ SITE_URL: 'https://example.com/', URL: 'https://project.netlify.app' }),
    ).toBe('https://example.com');
    expect(siteOrigin({ URL: 'https://unrelated.example' })).toBe('http://localhost:5173');
  });
  it('rejects invalid, insecure, or missing production origins', () => {
    for (const value of [
      'https://example.com/path',
      'https://user:secret@example.com',
      'https://example.com?q=x',
      'https://example.com#hash',
      'https://example.com:bad',
      'javascript:alert(1)',
      'http://example.com',
    ])
      expect(() => siteOrigin({ SITE_URL: value, CONTEXT: 'production' })).toThrow();
    expect(() => siteOrigin({ CONTEXT: 'production' })).toThrow();
  });
  it('only indexes production', () => {
    expect(shouldIndex({ CONTEXT: 'production' })).toBe(true);
    expect(shouldIndex({ CONTEXT: 'deploy-preview' })).toBe(false);
    expect(shouldIndex({})).toBe(false);
  });
  it('preserves all service URLs and a genuine missing-page route', () => {
    expect(routeKey('/')).toBe('home');
    expect(routeKey('/siding/')).toBe('siding');
    expect(routeKey('/windows')).toBe('windows');
    expect(routeKey('/missing/')).toBe('404');
    expect(routeKey('/404.html')).toBe('404');
    expect(pagePath('404')).toBe('/404.html');
  });
});

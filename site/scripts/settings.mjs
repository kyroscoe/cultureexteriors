export function siteOrigin(env = process.env) {
  const value = (env.SITE_URL || (env.NETLIFY === 'true' ? env.URL : '') || '').trim();
  if (!value && env.CONTEXT === 'production')
    throw new Error('Production builds require SITE_URL or the Netlify URL variable.');
  let url;
  try {
    url = new URL(value || 'http://localhost:5173');
  } catch {
    throw new Error('SITE_URL must be a valid absolute origin.');
  }
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    /\s/.test(value)
  )
    throw new Error(
      'SITE_URL must be an absolute origin without a path, credentials, query or fragment.',
    );
  if (env.CONTEXT === 'production' && url.protocol !== 'https:')
    throw new Error('Production SITE_URL must use HTTPS.');
  return url.origin;
}

export function shouldIndex(env = process.env) {
  return env.CONTEXT === 'production';
}

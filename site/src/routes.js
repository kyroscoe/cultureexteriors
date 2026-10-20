import content from './data/content.json' with { type: 'json' };

export const pages = {
  home: {
    title: 'Ohio Siding, Roofing, Windows & Gutters',
    description:
      'Culture Exteriors helps Ohio homeowners with siding, roofing, windows, and gutters. Explore materials and request an estimate for your home.',
  },
  ...Object.fromEntries(
    Object.entries(content.services).map(([key, service]) => [
      key,
      { title: `${service.title} Options & Homeowner Guide`, description: service.intro },
    ]),
  ),
  'our-work': {
    title: 'Exterior Inspiration',
    description: 'Browse siding, roofing, window, and gutter details for your own home.',
  },
  about: { title: 'About Culture Exteriors', description: content.company.intro },
  faqs: {
    title: 'Frequently Asked Questions',
    description: 'Useful answers as you consider an exterior improvement.',
  },
  'service-area': {
    title: 'Service Area',
    description:
      'Siding, roofing, windows, and gutters for Ohio homeowners. Ask about availability in your city.',
  },
  contact: {
    title: 'Request an Estimate',
    description:
      'Tell Culture Exteriors about your Ohio home and the exterior work you have in mind.',
  },
  privacy: { title: 'Privacy', description: 'A short notice for estimate inquiries.' },
  photography: {
    title: 'Photography Credits',
    description:
      'The photographs on this site are stock reference images, not Culture Exteriors projects.',
  },
  404: {
    title: 'Page Not Found',
    description:
      'The page you requested could not be found. Return to Culture Exteriors or contact us about your home.',
  },
};

export function pagePath(key) {
  return key === 'home' ? '/' : key === '404' ? '/404.html' : `/${key}/`;
}

export function routeKey(pathname) {
  const key =
    pathname === '/' || pathname === '/index.html' ? 'home' : pathname.replace(/^\/|\/$/g, '');
  return Object.hasOwn(pages, key) ? key : '404';
}

export const pages = {
  home: {
    title: 'Siding, Roofing, Windows & Gutters',
    description:
      'Culture Homes & Exteriors helps homeowners with siding, roofing, windows, and gutters. Get in touch to discuss your home and request an estimate.',
  },
  contact: {
    title: 'Contact',
    description:
      'Tell Culture Homes & Exteriors about your home and the exterior work you have in mind.',
  },
  404: {
    title: 'Page Not Found',
    description:
      'The page you requested could not be found. Return to Culture Homes & Exteriors or contact us about your home.',
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

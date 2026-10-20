# Launch checklist

## Deployment prepared

The React + Vite source is in `site/src/`. Node generates pre-rendered pages plus bundled JavaScript/CSS in `site/dist/`. No Python is required. Dependency/runtime versions, GitHub checks and Netlify configuration are supplied.

## Contact delivery

The current form prepares a draft for the visitor to review and send. It does not send automatically. The direct address remains info@cultureexteriors.com; its disclosure and privacy notice match this behavior.

Choose Netlify Forms or a same-origin Netlify Function plus an email provider before enabling online delivery. Netlify Forms needs form detection, the appropriate HTML/encoding and response handler, spam protection, and a submission notification to info@cultureexteriors.com. A function needs server-held provider credentials, a verified sender, server validation, fixed recipient, rate limits and bot protection.

Neither integration is enabled by this cleanup. The current optional endpoint expects JSON `{ "accepted": true }`; Netlify Forms uses a different contract and must not be enabled merely by setting `estimateEndpoint`. Update form copy and privacy notices with the integration. Test with mocks/sandbox first, then verify real notification/delivery configuration before advertising automatic submission. Never put credentials in browser code or public content.

References: [Netlify Forms](https://docs.netlify.com/manage/forms/setup/), [spam filters](https://docs.netlify.com/manage/forms/spam-filters/).

## Domain and final review

- Connect the intended domain and verify HTTPS. Optionally set `SITE_URL` to its preferred origin, with no path or query, and rebuild.
- Check canonicals, sitemap and robots on the deployed domain. Production should be indexable; previews should not.
- Check actual desktop/mobile layouts, keyboard focus, the menu, contact behavior, missing-page response and image crops on Netlify.

## Owner content and media

Confirmed information: Culture Exteriors, the supplied logo, Ohio, siding/roofing/windows/gutters, and info@cultureexteriors.com. City coverage, product availability, specific repair/inspection/low-slope capabilities and operational details still require owner approval. No unverified team, history, credentials, ratings, warranties, financing or manufacturer relationships are published.

Supply licensed slow pullback/ascent drone footage and a matching poster to enable the conditional video component. Approved company projects and matched before/after photographs are needed before replacing the stock-only Exterior Inspiration presentation with Our Work. Verified reviews and other optional sections remain hidden until supplied.

Photo records are retained in `photography/sources.json` and the public credits page.

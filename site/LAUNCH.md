# Launch checklist

## Deployment prepared

The React + Vite source is in `site/src/`. Node generates pre-rendered pages plus bundled JavaScript/CSS in `site/dist/`. No Python is required. Dependency/runtime versions, GitHub checks and Netlify configuration are supplied.

## Contact delivery

The estimate form submits directly to Netlify Forms. The built contact page contains a hidden `estimate` form outside React's root, with the same fields as the visible form. This lets Netlify detect the form without altering React's hydrated markup. Requests are URL-encoded, include `form-name=estimate`, retain multiple `services[]` values, and include the `website` honeypot. The `email` field supplies the submitter's reply-to address.

Owner setup in Netlify:

1. Keep form detection enabled, then deploy this commit.
2. Confirm `estimate` appears under **Forms**.
3. Under **Forms > Submission notifications**, add an email notification to **info@cultureexteriors.com** for the `estimate` form. Enabling detection alone does not configure email notifications.
4. Submit an owner-approved test on the live site. Confirm it appears in Netlify and that the notification arrives. Check Spam submissions if it is filtered.

The page shows success only after a successful Netlify HTTP response. Failed requests keep the visitor's details. No email-delivery guarantee is made: receipt by Netlify and email notification delivery are separate. The direct email link remains available. Vite development and preview servers reject submissions with HTTP 501; automated tests mock Netlify acceptance and do not send real inquiries. Native form submission is also available without JavaScript, with browser validation and Netlify's default success page.

References: [Netlify Forms](https://docs.netlify.com/manage/forms/setup/), [notifications](https://docs.netlify.com/manage/forms/notifications/), [spam filters](https://docs.netlify.com/manage/forms/spam-filters/).

## Domain and final review

- Connect the intended domain and verify HTTPS. Optionally set `SITE_URL` to its preferred origin, with no path or query, and rebuild.
- Check canonicals, sitemap and robots on the deployed domain. Production should be indexable; previews should not.
- Check actual desktop/mobile layouts, keyboard focus, the menu, contact behavior, missing-page response and image crops on Netlify.

## Owner content and media

Confirmed information: Culture Homes & Exteriors, the supplied logo, Ohio, siding/roofing/windows/gutters, and info@cultureexteriors.com. City coverage, product availability, specific repair/inspection/low-slope capabilities and operational details still require owner approval. No unverified team, history, credentials, ratings, warranties, financing or manufacturer relationships are published.

Supply licensed slow pullback/ascent drone footage and a matching poster to enable the conditional video component. Approved company projects and matched before/after photographs are needed before replacing the stock-only Exterior Inspiration presentation with Our Work. Verified reviews and other optional sections remain hidden until supplied.

Photo records are retained in `photography/sources.json` and the public credits page.

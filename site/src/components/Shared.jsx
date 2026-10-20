import content from '../data/content.json';
import dimensions from '../data/asset-dimensions.json';

export function Button({
  children = 'Request an Estimate',
  href = '/contact/',
  className = '',
  arrow = true,
  ...props
}) {
  return (
    <a className={`btn ${className}`} href={href} {...props}>
      {children}
      {arrow && (
        <>
          {' '}
          <span aria-hidden="true">↗</span>
        </>
      )}
    </a>
  );
}

export function Photo({ name, alt, className = '', eager = false }) {
  const widths = name === 'hero' ? [960, 1920] : [640, 1200];
  const [width, height] = dimensions[`${name}-${widths[1]}.webp`];
  return (
    <picture className={className}>
      <img
        src={`/assets/${name}-${widths[1]}.webp`}
        srcSet={`/assets/${name}-${widths[0]}.webp ${widths[0]}w, /assets/${name}-${widths[1]}.webp ${widths[1]}w`}
        sizes={name === 'hero' ? '100vw' : '(max-width: 600px) 88vw, 50vw'}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
      />
    </picture>
  );
}

export function Faqs({ items }) {
  return items.map(([question, answer]) => (
    <details className="faq" key={question}>
      <summary>{question}</summary>
      <p>{answer}</p>
    </details>
  ));
}

export function CallToAction() {
  return (
    <section className="cta">
      <div className="wrap">
        <div>
          <span className="eyebrow">Have a project in mind?</span>
          <h2>Let’s take a look.</h2>
          <p>Tell us about your home, the work you’re considering, and your location.</p>
        </div>
        <Button />
      </div>
    </section>
  );
}

export function Logo({ lazy = false }) {
  return (
    <a className="logo" href="/" aria-label="Culture Exteriors home">
      <img
        src="/assets/culture-logo.jpeg"
        width="898"
        height="441"
        alt="Culture Homes & Exteriors"
        loading={lazy ? 'lazy' : undefined}
      />
    </a>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Logo lazy />
            <p>Siding. Roofing. Windows. Gutters.</p>
          </div>
          <div>
            <h3>Explore</h3>
            {Object.entries(content.services).map(([key, service]) => (
              <a href={`/${key}/`} key={key}>
                {service.title}
              </a>
            ))}
          </div>
          <div>
            <h3>Culture Exteriors</h3>
            <a href="/about/">About us</a>
            <a href="/our-work/">Exterior Inspiration</a>
            <a href="/faqs/">FAQs</a>
            <a href="/service-area/">Service area</a>
          </div>
          <div>
            <h3>Start a conversation</h3>
            <a href={`mailto:${content.company.email}`}>{content.company.email}</a>
            <a href="/contact/">Request an estimate ↗</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Culture Exteriors</span>
          <a href="/privacy/">Privacy</a>
        </div>
      </div>
    </footer>
  );
}

export function PageLayout({ title, headline, intro, children, cta = true }) {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <a href="/">Home</a> / {title}
          </div>
          <span className="eyebrow">Culture Exteriors</span>
          <h1>{headline}</h1>
          <p>{intro}</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">{children}</div>
      </section>
      {cta && <CallToAction />}
    </>
  );
}

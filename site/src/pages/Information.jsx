import content from '../data/content.json';
import sources from '../../photography/sources.json';
import { generalFaqs } from '../data/faqs';
import { Button, Faqs, PageLayout, Photo } from '../components/Shared';
import Gallery, { BeforeAfter } from '../components/Gallery';

export function Inspiration() {
  return (
    <PageLayout
      title="Exterior Inspiration"
      headline="Exterior details, for reference."
      intro="Browse siding, roofing, window, and gutter details for your own home."
    >
      <Gallery />
      <BeforeAfter />
    </PageLayout>
  );
}

export function About() {
  return (
    <PageLayout
      title="About Culture Homes & Exteriors"
      headline="Culture Homes & Exteriors "
      intro={content.company.intro}
    >
      <div className="split">
        <div>
          <Photo name="siding" alt={content.services.siding.alt} />
          <p className="note">Exterior inspiration</p>
        </div>
        <div>
          <h2>Siding. Roofing. Windows. Gutters.</h2>
          <p>{content.company.about}</p>
          <p>
            Siding, roofing, windows, and gutters each affect how a home looks and handles the
            weather. Send us a few project details or photos so the first conversation can focus on
            your home.
          </p>
          <Button>Start a Conversation</Button>
        </div>
      </div>
    </PageLayout>
  );
}

export function FaqPage() {
  return (
    <PageLayout
      title="Frequently Asked Questions"
      headline="Before you plan the work."
      intro="Useful answers as you consider an exterior improvement."
    >
      <Faqs items={generalFaqs} />
      {Object.values(content.services).map((service) => (
        <section key={service.title}>
          <h2 style={{ marginTop: 60 }}>{service.title}</h2>
          <Faqs items={service.faqs} />
        </section>
      ))}
    </PageLayout>
  );
}

export function ServiceArea() {
  const areas = content.company.serviceAreas;
  return (
    <PageLayout
      title="Service Area"
      headline="Where is your project?"
      intro="Siding, roofing, windows, and gutters for Ohio homeowners. Ask about availability in your city."
    >
      <div className="split">
        <div>
          <h2>Exterior improvements.</h2>
          <p>
            {areas.length
              ? `Culture Homes & Exteriors serves homeowners in ${areas.join(', ')}. Send your city and ZIP code to check availability for your project.`
              : 'Send your city and ZIP code to check availability for your home.'}
          </p>
          <p>Send your city, ZIP code, and a brief description of the work you need.</p>
          <a className="contact-email" href={`mailto:${content.company.email}`}>
            {content.company.email}
          </a>
        </div>
        <div>
          <Photo name="hero" alt="Home and surrounding green landscape" />
        </div>
      </div>
    </PageLayout>
  );
}

export function Privacy() {
  return (
    <PageLayout
      title="Privacy"
      headline="Your project details, handled thoughtfully."
      intro="A short notice for estimate inquiries."
    >
      <div style={{ maxWidth: 750 }}>
        <h2>Information you choose to share.</h2>
        <p>
          When you submit the estimate form, your contact details, location, selected services, and
          project description are sent to Culture Homes & Exteriors through Netlify Forms. Netlify
          processes and stores submissions to handle your inquiry and filter spam.
        </p>
        <p>
          We use the information you share to respond to your project inquiry. Please avoid sending
          sensitive personal or financial information. No marketing consent is required.
        </p>
        <p>
          No advertising trackers or analytics have been added. Google Fonts may receive routine
          connection information when fonts load; all exterior images are served locally. The
          hosting provider may maintain operational access logs.
        </p>
        <p>
          Contact <a href={`mailto:${content.company.email}`}>{content.company.email}</a> with
          privacy questions or requests about the information you have submitted.
        </p>
      </div>
    </PageLayout>
  );
}

export function Photography() {
  return (
    <PageLayout title="Photography Credits" headline="Real homes. Credited photographers.">
      <div className="credits-list">
        {sources.selected.map((photo) => (
          <article key={photo.page}>
            <h2>{photo.photographer}</h2>
            <p>{photo.reason}</p>
          </article>
        ))}
      </div>
    </PageLayout>
  );
}

export function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <span className="eyebrow">404 / Page not found</span>
        <h1>That page isn’t here.</h1>
        <p>
          The address may have changed. Find our services from the menu, or tell us about your
          project.
        </p>
        <Button href="/">Return Home</Button> <Button className="dark-outline">Contact Us</Button>
      </div>
    </section>
  );
}

import content from '../data/content.json';
import { PageLayout } from '../components/Shared';
import EstimateForm from '../components/EstimateForm';

export default function Contact() {
  return (
    <PageLayout
      title="Contact"
      headline="Tell us about the work."
      intro="Tell Culture Homes & Exteriors about your Ohio home and the exterior work you have in mind."
      cta={false}
    >
      <div className="contact-layout">
        <aside>
          <span className="eyebrow">Start with a conversation</span>
          <h2>
            What needs
            <br />
            attention?
          </h2>
          <p>Share a few details about your home and the changes you have in mind.</p>
          <a className="contact-email" href={`mailto:${content.company.email}`}>
            {content.company.email}
          </a>
          <p className="note">
            Include your city and ZIP/postal code so we can confirm service availability.
          </p>
        </aside>
        <EstimateForm />
      </div>
      <details className="faq contact-privacy" id="privacy">
        <summary>Privacy notice</summary>
        <p>
          Your contact details, location, selected services, and project description are sent to
          Culture Homes & Exteriors through Netlify Forms, which processes and stores submissions to
          handle inquiries and filter spam. We use your details to respond to your inquiry. No
          marketing signup is required.
        </p>
        <p>
          No advertising trackers or analytics have been added. Google Fonts receives routine
          connection information when fonts load, and the hosting provider may keep access logs. For
          questions about your information, email{' '}
          <a href={`mailto:${content.company.email}`}>{content.company.email}</a>.
        </p>
      </details>
    </PageLayout>
  );
}

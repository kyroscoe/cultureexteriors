import content from '../data/content.json';
import { PageLayout } from '../components/Shared';
import EstimateForm from '../components/EstimateForm';

export default function Contact() {
  return (
    <PageLayout
      title="Request an Estimate"
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
    </PageLayout>
  );
}

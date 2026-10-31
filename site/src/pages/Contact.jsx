import { useEffect, useRef } from 'react';
import content from '../data/content.json';
import { PageLayout } from '../components/Shared';
import EstimateForm from '../components/EstimateForm';

export default function Contact() {
  const privacy = useRef(null);
  useEffect(() => {
    function openPrivacy() {
      if (window.location.hash === '#privacy') privacy.current.open = true;
    }
    function onPrivacyLink(event) {
      if (event.target.closest('a[href="#privacy"]')) privacy.current.open = true;
    }
    openPrivacy();
    window.addEventListener('hashchange', openPrivacy);
    document.addEventListener('click', onPrivacyLink);
    return () => {
      window.removeEventListener('hashchange', openPrivacy);
      document.removeEventListener('click', onPrivacyLink);
    };
  }, []);
  return (
    <PageLayout
      title="Contact"
      headline="Tell us about the work."
      intro="Share a few details about your home and the work you have in mind."
      cta={false}
    >
      <div className="contact-layout">
        <aside>
          <span className="eyebrow">Start with a conversation</span>
          <h2>Let’s talk.</h2>
          <a className="contact-email" href={`mailto:${content.company.email}`}>
            {content.company.email}
          </a>
          <p className="note">
            Include your city and ZIP code so we can confirm availability for your project.
          </p>
        </aside>
        <EstimateForm />
      </div>
      <details className="faq contact-privacy" id="privacy" ref={privacy}>
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

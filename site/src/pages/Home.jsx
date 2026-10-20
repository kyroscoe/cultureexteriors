import content from '../data/content.json';
import { generalFaqs } from '../data/faqs';
import { Button, CallToAction, Faqs, Photo } from '../components/Shared';
import Gallery from '../components/Gallery';
import HeroMedia from '../components/HeroMedia';

export default function Home() {
  return (
    <>
      <section className="editorial-hero">
        <div className="wrap hero-heading">
          <div>
            <span className="eyebrow">Culture Exteriors</span>
            <h1>
              Built to Protect.
              <br />
              Designed to last.
            </h1>
          </div>
          <div className="hero-intro">
            <p>
              Siding, roofing, windows, and gutters for home. Tell us what needs attention. We’ll
              help you plan the next step.
            </p>
            <Button />
            <a className="text-link" href="#services">
              Explore our services ↓
            </a>
          </div>
        </div>
        <HeroMedia />
      </section>
      <section className="section service-index" id="services">
        <div className="wrap index-layout">
          <div>
            <span className="eyebrow">Where do we start?</span>
            <h2>
              The outside
              <br /> works together.
            </h2>
            <p>
              Replace worn siding. Rethink the roofline. Bring windows, trim, and gutters into the
              same plan.
            </p>
            <a className="text-link" href="/about/">
              About Culture Exteriors ↗
            </a>
          </div>
          <div className="service-links">
            {Object.entries(content.services).map(([key, service]) => (
              <a key={key} href={`/${key}/`}>
                <span className="service-name">{service.title}</span>
                <span className="service-description">{service.short}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
            <p className="note">
              Materials and project scope are confirmed directly with Culture Exteriors.
            </p>
          </div>
        </div>
      </section>
      <section className="detail-story" id="about">
        <div className="wrap story-layout">
          <figure className="story-portrait">
            <Photo name="siding" alt={content.services.siding.alt} />
            <figcaption>Lap siding, window trim & soffit.</figcaption>
          </figure>
          <div className="story-copy">
            <span className="eyebrow">The details at eye level</span>
            <h2>
              A straight line.
              <br />A clean edge.
              <br />A proper finish.
            </h2>
            <p>
              How siding meets a window. How trim turns a corner. How the roof edge handles rain.
              Those connections deserve as much attention as the color you choose.
            </p>
            <a className="text-link" href="/siding/#details">
              Explore siding & trim ↗
            </a>
            <figure className="story-landscape">
              <Photo
                name="eaves"
                alt="White soffit, fascia and gutter at a residential roof edge against a blue sky. Photograph by Sebastian Schuster."
              />
              <figcaption>Soffit, fascia & the roof edge.</figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section className="section reference-section" id="work">
        <div className="wrap">
          <div className="reference-head">
            <div>
              <span className="eyebrow">Exterior reference library</span>
              <h2>Look closely.</h2>
            </div>
            <p>
              Compare textures, profiles, and the junctions between materials for your own project.
            </p>
          </div>
          <Gallery />
        </div>
      </section>
      <section className="section project-planning">
        <div className="wrap planning-layout">
          <div>
            <span className="eyebrow">Before work begins</span>
            <h2>Know what to ask.</h2>
            <p>
              Have a clear scope before work begins. Ask about materials, scheduling, site
              preparation, and the final review.
            </p>
          </div>
          <ol className="project-steps">
            {content.process.map(([title, description]) => (
              <li key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section" id="questions">
        <div className="wrap faq-layout">
          <div>
            <span className="eyebrow">Before you get started</span>
            <h2>
              A few practical
              <br />
              questions.
            </h2>
            <a className="text-link" href="/faqs/">
              Read all FAQs ↗
            </a>
          </div>
          <div>
            <Faqs items={generalFaqs.slice(1, 4)} />
          </div>
        </div>
      </section>
      <CallToAction />
    </>
  );
}

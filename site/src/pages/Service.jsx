import content from '../data/content.json';
import { Button, CallToAction, Faqs, Photo } from '../components/Shared';

const details = {
  siding: ['eaves', 'White soffit and fascia at a roof edge', 'Franco Debartolo'],
  roofing: ['roof-texture', 'Close-up of dimensional asphalt shingles', 'Roger Starnes Sr.'],
  windows: ['windows', content.services.windows.alt, 'Rob Wingate'],
  gutters: [
    'gutter-maintenance',
    'Leaves at a gutter edge, illustrating seasonal cleaning needs',
    'Zachary Keimig',
  ],
};

export default function Service({ serviceKey }) {
  const service = content.services[serviceKey];
  const [detailImage, detailAlt, photographer] = details[serviceKey];
  return (
    <>
      <section className={`service-opening service-${serviceKey}`}>
        <div className="wrap service-heading">
          <div>
            <div className="breadcrumb">
              <a href="/">Home</a> / {service.title}
            </div>
            <span className="eyebrow">{service.title} / Homeowner guide</span>
            <h1>
              {service.headline.split('\n').map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h1>
          </div>
          <div className="service-summary">
            <p>{service.intro}</p>
            <Button />
            <div className="chapter-links">
              <a href="#options">Materials</a>
              <a href="#details">Details</a>
              <a href="#questions">Questions</a>
            </div>
          </div>
        </div>
        <div className="wrap service-photo">
          <Photo name={serviceKey} alt={service.alt} eager />
          <p className="note">
            Inspiration photograph / {photographer}. <a href="/photography/">Source & license</a>
          </p>
        </div>
      </section>
      <section className="section" id="options">
        <div className="wrap material-layout">
          <div>
            <span className="eyebrow">Choose the material</span>
            <h2>Compare your options.</h2>
            <p className="note">
              Compare common materials, then ask which options fit your project.
            </p>
          </div>
          <div className="table-scroll">
            <table className="comparison">
              <caption className="note">
                Appearance and maintenance vary by product and exposure.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Material / system</th>
                  <th scope="col">Appearance & considerations</th>
                  <th scope="col">Care & maintenance</th>
                </tr>
              </thead>
              <tbody>
                {service.materials.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => (
                      <td key={cell}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="section service-details" id="details">
        <div className="wrap detail-layout">
          <div className="detail-visual">
            <Photo name={detailImage} alt={detailAlt} />
            <p className="note">
              Reference detail. <a href="/photography/">Photo credits</a>
            </p>
          </div>
          <div>
            <span className="eyebrow">Plan the details</span>
            <h2>{service.detailTitle}</h2>
            <div className="detail-list">
              {service.details.map(([title, description]) => (
                <article className="detail-item" key={title}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="section" id="questions">
        <div className="wrap faq-layout">
          <div>
            <span className="eyebrow">Common questions</span>
            <h2>About {service.title.toLowerCase()}.</h2>
          </div>
          <div>
            <Faqs items={service.faqs} />
          </div>
        </div>
      </section>
      <section className="related-section">
        <div className="wrap">
          <h2>Plan the rest of your exterior.</h2>
          <div className="related">
            {Object.entries(content.services)
              .filter(([key]) => key !== serviceKey)
              .map(([key, related]) => (
                <Button key={key} href={`/${key}/`} className="dark-outline">
                  {related.title}
                </Button>
              ))}
          </div>
          <p className="note">
            Educational references:{' '}
            {service.sources.map(([label, url], index) => (
              <span key={url}>
                {index > 0 && ' · '}
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </span>
            ))}
            . References do not imply manufacturer partnerships.
          </p>
        </div>
      </section>
      <CallToAction />
    </>
  );
}

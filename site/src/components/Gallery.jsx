import { useState } from 'react';
import content from '../data/content.json';
import { Photo } from './Shared';

const labels = {
  siding: ['Lap siding & window trim'],
  roofing: ['Rooflines & asphalt shingles'],
  windows: ['Casement windows & daylight'],
  gutters: ['Gutter, fascia & downspout'],
};

export default function Gallery() {
  const [filter, setFilter] = useState('all');
  const count = filter === 'all' ? 4 : 1;
  return (
    <>
      <div className="filters" role="group" aria-label="Filter exterior inspiration">
        {[
          ['all', 'All details'],
          ...Object.entries(content.services).map(([key, service]) => [key, service.title]),
        ].map(([key, label]) => (
          <button
            className="filter"
            key={key}
            data-filter={key}
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="sr-status note" aria-live="polite" id="gallery-status">
        Showing {count} {filter === 'all' ? 'inspiration' : filter} image{count === 1 ? '' : 's'}
      </p>
      <div className="gallery">
        {Object.entries(content.services).map(([key, service]) => (
          <figure key={key} data-service={key} hidden={filter !== 'all' && filter !== key}>
            <Photo name={key} alt={service.alt} />
            <figcaption>
              <span>{labels[key][0]}</span>
              <small>{labels[key][1]}</small>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}

export function BeforeAfter({ pair = content.beforeAfter }) {
  const [amount, setAmount] = useState(50);
  if (!pair?.approved || !pair.before || !pair.after) return null;
  return (
    <section id="comparison-mount">
      <h2>{pair.title || 'Before & after'}</h2>
      <div className="comparison-view">
        <img
          className="after"
          src={pair.after}
          alt={pair.afterAlt || 'After the exterior project'}
          width="1200"
          height="800"
          loading="lazy"
        />
        <img
          className="before"
          src={pair.before}
          alt={pair.beforeAlt || 'Before the exterior project'}
          width="1200"
          height="800"
          loading="lazy"
          style={{ clipPath: `inset(0 ${100 - amount}% 0 0)` }}
        />
      </div>
      <input
        className="comparison-range"
        type="range"
        min="0"
        max="100"
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value))}
        aria-label="Reveal before photo, from 0 to 100 percent"
        aria-valuetext={`${amount} percent before photo`}
      />
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import content from '../data/content.json';
import { Photo } from './Shared';

export default function HeroMedia({ footage = content.heroVideo }) {
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);
  const [source, setSource] = useState('');

  useEffect(() => {
    if (!footage.desktop || !video.current) return;
    const media = video.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection;
    let disposed = false;
    function update() {
      media.pause();
      setAvailable(false);
      setPlaying(false);
      const constrained =
        reduced.matches || connection?.saveData || /2g/.test(connection?.effectiveType || '');
      // Mobile devices use the photograph unless a mobile video is explicitly supplied.
      setSource(
        constrained ? '' : window.innerWidth < 768 ? footage.mobile || '' : footage.desktop,
      );
    }
    update();
    const onChange = () => {
      if (!disposed) update();
    };
    reduced.addEventListener('change', onChange);
    connection?.addEventListener('change', onChange);
    return () => {
      disposed = true;
      media.pause();
      reduced.removeEventListener('change', onChange);
      connection?.removeEventListener('change', onChange);
    };
  }, [footage.desktop, footage.mobile]);

  useEffect(() => {
    if (!source || !video.current) return;
    let disposed = false;
    const media = video.current;
    media.muted = true;
    media
      .play()
      .then(() => {
        if (!disposed) {
          setAvailable(true);
          setPlaying(true);
        }
      })
      .catch(() => {
        if (!disposed) setSource('');
      });
    return () => {
      disposed = true;
    };
  }, [source]);

  async function toggle() {
    if (playing) {
      video.current.pause();
      setPlaying(false);
      return;
    }
    try {
      await video.current.play();
      setPlaying(true);
    } catch {
      setSource('');
      setAvailable(false);
    }
  }

  return (
    <div className="hero-media">
      <Photo
        name="hero"
        eager
        alt="Suburban home with lap siding, asphalt roof, white trim and front lawn. "
      />
      {footage.desktop && (
        <video
          ref={video}
          id="hero-video"
          src={source || undefined}
          muted
          autoPlay
          loop
          playsInline
          preload="none"
          poster="/assets/hero-1920.webp"
          aria-label="Neighborhood exterior footage"
          hidden={!available}
          onError={() => {
            setSource('');
            setAvailable(false);
            setPlaying(false);
          }}
        />
      )}
      <div className="natural-overlay" />
      <div className="media-caption">
        <span>Home, in perspective.</span>
        <div>
          <a href="/photography/" id="video-label">
            {available ? 'A new perspective on home' : 'Still photograph'}
          </a>
          {available && (
            <button
              className="video-control"
              id="video-toggle"
              onClick={toggle}
              aria-label={playing ? 'Pause background video' : 'Play background video'}
            >
              {playing ? 'Pause video Ⅱ' : 'Play video ▷'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

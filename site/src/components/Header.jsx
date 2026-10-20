import { useEffect, useRef, useState } from 'react';
import content from '../data/content.json';
import { Button, Logo } from './Shared';

export default function Header({ current }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openService, setOpenService] = useState(null);
  const header = useRef(null);
  const menu = useRef(null);

  useEffect(() => {
    function onClick(event) {
      if (!event.target.closest('.nav-group')) setOpenService(null);
    }
    function onKeyDown(event) {
      if (event.key !== 'Escape') return;
      if (openService) {
        header.current.querySelector(`#nav-toggle-${openService}`).focus();
        setOpenService(null);
      } else if (mobileOpen) {
        setMobileOpen(false);
        menu.current.focus();
      }
    }
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen, openService]);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header" ref={header}>
        <div className="header-inner">
          <Logo />
          <nav
            className={`nav${mobileOpen ? ' mobile-open' : ''}`}
            id="navigation"
            aria-label="Main navigation"
          >
            <a href="/" aria-current={current === 'home' ? 'page' : undefined}>
              Home
            </a>
            {Object.entries(content.services).map(([key, service]) => (
              <div
                key={key}
                className={`nav-group${openService === key ? ' open' : ''}`}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setOpenService(null);
                }}
              >
                <a href={`/${key}/`} aria-current={current === key ? 'page' : undefined}>
                  {service.title}
                </a>
                <button
                  id={`nav-toggle-${key}`}
                  className="nav-toggle"
                  aria-expanded={openService === key}
                  aria-controls={`nav-${key}`}
                  aria-label={`Show ${key} topics`}
                  onClick={() => setOpenService(openService === key ? null : key)}
                >
                  ⌄
                </button>
                <div className="dropdown" id={`nav-${key}`}>
                  <a href={`/${key}/#options`}>Compare materials</a>
                  <a href={`/${key}/#details`}>Design & details</a>
                  <a href={`/${key}/#questions`}>Common questions</a>
                </div>
              </div>
            ))}
            <a href="/our-work/" aria-current={current === 'our-work' ? 'page' : undefined}>
              Exterior Inspiration
            </a>
            <a href="/contact/" aria-current={current === 'contact' ? 'page' : undefined}>
              Contact
            </a>
          </nav>
          <Button className="light header-estimate" arrow={false} aria-label="Request an Estimate">
            <span>
              <span className="estimate-prefix">Request an </span>Estimate
            </span>
          </Button>
          <button
            ref={menu}
            className="menu-button"
            aria-expanded={mobileOpen}
            aria-controls="navigation"
            onClick={() => {
              setMobileOpen(!mobileOpen);
              setOpenService(null);
            }}
          >
            {mobileOpen ? 'Close ×' : 'Menu ☰'}
          </button>
        </div>
      </header>
    </>
  );
}

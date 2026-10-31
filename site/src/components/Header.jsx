import { useEffect, useRef, useState } from 'react';
import { Button, Logo } from './Shared';

export default function Header({ current }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menu = useRef(null);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
        menu.current.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <div className="header-inner">
          <Logo />
          <nav
            className={mobileOpen ? 'nav mobile-open' : 'nav'}
            id="navigation"
            aria-label="Main navigation"
          >
            <a href="/" aria-current={current === 'home' ? 'page' : undefined}>
              Home
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
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? 'Close ×' : 'Menu ☰'}
          </button>
        </div>
      </header>
    </>
  );
}

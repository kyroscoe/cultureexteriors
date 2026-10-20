import { useEffect } from 'react';
import content from './data/content.json';
import Header from './components/Header';
import { Footer } from './components/Shared';
import Home from './pages/Home';
import Service from './pages/Service';
import Contact from './pages/Contact';
import {
  About,
  FaqPage,
  Inspiration,
  NotFound,
  Photography,
  Privacy,
  ServiceArea,
} from './pages/Information';
import { pages } from './routes';

const informationPages = {
  'our-work': Inspiration,
  about: About,
  faqs: FaqPage,
  'service-area': ServiceArea,
  privacy: Privacy,
  photography: Photography,
  404: NotFound,
};

export default function App({ pageKey = 'home' }) {
  const Page = informationPages[pageKey];
  useEffect(() => {
    document.body.className = `page-${pageKey}`;
    document.title = `${pages[pageKey].title} | Culture Homes & Exteriors`;
    function keepFocusVisible(event) {
      const target = event.target;
      if (!target.closest?.('main')) return;
      requestAnimationFrame(() => {
        const headerHeight = document.querySelector('.header').getBoundingClientRect().height;
        const top = target.getBoundingClientRect().top;
        if (top < headerHeight + 16)
          window.scrollBy({ top: top - headerHeight - 24, behavior: 'instant' });
      });
    }
    document.addEventListener('focusin', keepFocusVisible);
    return () => document.removeEventListener('focusin', keepFocusVisible);
  }, [pageKey]);
  return (
    <>
      <Header current={pageKey} />
      <main id="main">
        {pageKey === 'home' ? (
          <Home />
        ) : content.services[pageKey] ? (
          <Service serviceKey={pageKey} />
        ) : pageKey === 'contact' ? (
          <Contact />
        ) : (
          <Page />
        )}
      </main>
      <Footer />
    </>
  );
}

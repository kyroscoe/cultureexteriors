import { useEffect } from 'react';
import Header from './components/Header';
import { Footer } from './components/Shared';
import Home from './pages/Home';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import { pages } from './routes';

export default function App({ pageKey = 'home' }) {
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
        {pageKey === 'home' ? <Home /> : pageKey === 'contact' ? <Contact /> : <NotFound />}
      </main>
      <Footer />
    </>
  );
}

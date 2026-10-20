import { renderToString } from 'react-dom/server';
import App from './App';

// Used only by the Node build script. Netlify serves the resulting static files.
export function render(pageKey) {
  return renderToString(<App pageKey={pageKey} />);
}

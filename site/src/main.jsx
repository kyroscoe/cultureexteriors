import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { routeKey } from './routes';
import './styles.css';

const root = document.getElementById('root');
const app = <App pageKey={routeKey(window.location.pathname)} />;
if (root.hasAttribute('data-prerendered')) hydrateRoot(root, app);
else createRoot(root).render(app);

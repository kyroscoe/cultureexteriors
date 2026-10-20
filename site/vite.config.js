import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'static-preview-404',
      configurePreviewServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const pathname = new URL(request.url, 'http://preview.local').pathname;
          const target = resolve(server.config.root, 'dist', `.${decodeURIComponent(pathname)}`);
          const exists = await stat(target).catch(() => null);
          if (exists) return next();
          response.statusCode = 404;
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(await readFile(resolve(server.config.root, 'dist/404.html'), 'utf8'));
        });
      },
    },
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    include: ['tests/**/*.test.{js,jsx}'],
    restoreMocks: true,
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
/** Local QA server only: synthetic SDK, no production service worker or backend calls. */
export default defineConfig({
  plugins: [react(), { name: 'continuity-fixture', configureServer(server) {
    server.middlewares.use((request, _response, next) => { if (request.url?.split('?')[0] === '/' || /^\/(?:admin|auth)(?:\/|\?|$)/.test(request.url || '')) request.url = '/qa/continuity.html'; next(); });
  } }],
  resolve: { alias: [{ find: '@/integrations/supabase/client', replacement: path.join(root, 'qa/sdk.ts') }, { find: '@', replacement: path.join(root, 'src') }] },
  server: { host: '127.0.0.1', port: 5184, strictPort: true },
});

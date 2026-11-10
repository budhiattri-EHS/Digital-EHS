import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'https';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'google-drive-video-streamer',
      configureServer(server) {
        server.middlewares.use('/api/stream-video', (req, res) => {
          try {
            const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const driveId = url.searchParams.get('id') || url.searchParams.get('driveId');
            if (!driveId) {
              res.statusCode = 400;
              res.end('Missing id parameter');
              return;
            }

            const targetUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
            const headers: Record<string, string> = {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            };

            const reqRange = req.headers['range'];
            if (reqRange) {
              headers['Range'] = Array.isArray(reqRange) ? reqRange[0] : reqRange;
            }

            const gReq = https.get(targetUrl, { headers }, (gRes) => {
              res.statusCode = gRes.statusCode || 200;
              const safeHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'last-modified', 'etag', 'cache-control'];
              for (const [k, v] of Object.entries(gRes.headers)) {
                if (safeHeaders.includes(k.toLowerCase()) && v !== undefined) {
                  res.setHeader(k, v);
                }
              }
              res.setHeader('Content-Type', 'video/mp4');
              res.setHeader('Content-Disposition', 'inline');
              res.setHeader('Accept-Ranges', 'bytes');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
              gRes.pipe(res);
            });

            gReq.on('error', (err) => {
              res.statusCode = 502;
              res.end('Stream Gateway Error: ' + err.message);
            });

            req.on('close', () => {
              gReq.destroy();
            });
          } catch (e: any) {
            res.statusCode = 500;
            res.end('Internal Server Error: ' + e?.message);
          }
        });
      }
    }
  ],
  server: {
    host: true,
    port: 5173
  }
});

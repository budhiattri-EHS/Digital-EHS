// SBL EHS Digital LMS - High Performance Video Proxy Service Worker
// Streams Google Drive MP4s natively into HTML5 <video> with byte-range support,
// zero CORP blocking, instant scrubbing, and zero dimming.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Allow /api/stream-video to pass directly to the server gateway without Service Worker interference
  if (url.pathname.includes('/api/stream-video')) {
    return;
  }

  if (url.pathname.includes('/video-proxy/')) {
    let driveId = url.searchParams.get('id') || url.searchParams.get('driveId');
    if (!driveId) {
      const match = url.pathname.match(/\/(?:api\/stream-video|video-proxy)\/([a-zA-Z0-9_-]+)/);
      if (match) driveId = match[1];
    }

    if (!driveId) return;

    const targetUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;

    const reqHeaders = new Headers();
    const range = event.request.headers.get('range');
    if (range) {
      reqHeaders.set('Range', range);
    }
    reqHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    event.respondWith(
      fetch(targetUrl, {
        method: 'GET',
        headers: reqHeaders,
        mode: 'cors'
      }).then(response => {
        const cleanHeaders = new Headers();
        ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control', 'last-modified', 'etag'].forEach(h => {
          const val = response.headers.get(h);
          if (val) cleanHeaders.set(h, val);
        });

        if (!cleanHeaders.has('content-type')) {
          cleanHeaders.set('content-type', 'video/mp4');
        }
        cleanHeaders.set('accept-ranges', 'bytes');
        cleanHeaders.set('access-control-allow-origin', '*');

        return new Response(response.body, {
          status: response.status || 206,
          statusText: response.statusText || 'Partial Content',
          headers: cleanHeaders
        });
      }).catch(async () => {
        // Fallback to direct fetch
        return fetch(event.request);
      })
    );
  }
});

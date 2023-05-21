let keysToProp;

self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('.css')) {
    event.respondWith((async () => {

      const newResquest = new Request(event.request.url);
      newResquest.headers.set('x-custom-compression', '1');

      const response = await fetch(newResquest);
      const { status, statusText, headers } = response;

      if (keysToProp == null) {
        const cache = await caches.open('main');
        const resp = await cache.match(new Request('/keys-to-prop'));
        keysToProp = await resp.json();
      }

      let responseBody = await response.text();
      for (const [key, prop] of Object.entries(keysToProp)) {
        responseBody = responseBody.replaceAll(key, prop);
      }
      const newBody = responseBody;

      return new Response(newBody, { status, statusText, headers });
    })());
  }
});

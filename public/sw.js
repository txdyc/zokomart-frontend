// Retire stale service worker registrations from earlier local/prototype builds.
// The current Next.js app does not register a service worker, but browsers that
// already have one registered will keep checking /sw.js until it unregisters.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.claim().then(() => self.registration.unregister()),
  );
});

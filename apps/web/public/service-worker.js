const CACHE_NAME = 'service-maintenance-v1'

// Only cache on install, don't fail if network unavailable
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Network first strategy for better compatibility
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // For same-origin requests, use network first
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(event.request)
        })
    )
  } else {
    // For cross-origin requests, just pass through
    event.respondWith(fetch(event.request).catch(() => new Response('Offline')))
  }
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  self.clients.claim()
})

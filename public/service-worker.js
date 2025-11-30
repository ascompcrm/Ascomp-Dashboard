const PRECACHE = 'ascomp-precache-v1'
const RUNTIME = 'ascomp-runtime-v1'
const PRECACHE_URLS = ['/', '/login', '/offline.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => Promise.resolve())
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== PRECACHE && cacheName !== RUNTIME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone()
          caches.open(RUNTIME).then((cache) => cache.put(event.request, copy))
          return response
        })
        .catch(() => caches.match(event.request).then((match) => match || caches.match('/offline.html')))
    )
    return
  }

  const { url } = event.request
  if (url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((response) => {
            const copy = response.clone()
            caches.open(RUNTIME).then((cache) => cache.put(event.request, copy))
            return response
          })
          .catch(() => cachedResponse)
        return cachedResponse || fetchPromise
      })
    )
  }
})

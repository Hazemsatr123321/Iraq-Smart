const CACHE_NAME = 'souq-iq-smart-cache-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Note: CDNs and external scripts are not cached by default by this service worker
  // to ensure latest versions are fetched when online.
];

// Install stage: Caching the essential app shell files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// Fetch stage: Implementing a network-first, falling back to cache strategy
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For HTML pages, always try network first to get the latest content.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // We got a response from the network.
        // Let's cache it for future offline use.
        
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // The network request failed, probably because the user is offline.
        // Let's try to serve from the cache instead.
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // If the request is not in the cache, it's a real network error.
            // You could return a custom offline page here if you had one.
          });
      })
  );
});

// Activate stage: Cleaning up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event listener
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  const data = event.data ? event.data.json() : { title: 'سوق العراق الذكي', body: 'لديك تحديث جديد!' };

  const title = data.title;
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
        url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event listener
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for(let i=0; i<clientList.length; i++) {
            if(clientList[i].focused) {
                client = clientList[i];
            }
        }
        return client.focus().then(c => c.navigate(urlToOpen));
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
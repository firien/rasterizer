const tag = '3';
const $prefix = 'RASTERIZER';
const $cacheName = `${$prefix}-${tag}`;

const $urls = [
  
  '/rasterizer/bundle.91be9fd6385063becf97.js',
  
  '/rasterizer/javascripts/rasterizer.e32357013679940304fc.js',
  
  '/rasterizer/stylesheets/index.807cc4522f36c1b97901.css',
  
  '/rasterizer/images/icon-152.e32b66be0ef69d4a3f4a.png',
  
  '/rasterizer/images/icon-167.771210605436c9a8ddfc.png',
  
  '/rasterizer/images/icon-180.161e5717866bbd291345.png',
  
  '/rasterizer/images/icon-192.93fb574989386d5f7756.png',
  
  '/rasterizer/images/icon-512.f8320492a7d062b44d8c.png',
  
  '/rasterizer/pwa.04f2a24a02790ef8db50.js',
  
  '/rasterizer/manifest.webmanifest',
  
  '/rasterizer/index.html',
  
  '/rasterizer/',
  
];

self.addEventListener('install', async (event) => {
  let cache = await event.waitUntil(caches.open($cacheName));
  await cache.addAll($urls);
})

const clearPreviousCaches = async () => {
  let keys = await caches.keys()
  keys = keys.filter((key) => {
    return (key != $cacheName) && key.startsWith($prefix)
  })
  for (let key of keys) {
   await caches.delete(key);
  }
}

self.addEventListener('activate', (event) => {
  return event.waitUntil(clearPreviousCaches())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open($cacheName).then((cache) => {
      return cache.match(event.request, {ignoreSearch: true})
    }).then((response) => {
      return response || fetch(event.request)
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
})

const tag = '4';
const prefix = 'RASTERIZER';
const cacheName = `${prefix}-${tag}`;

const urls = [
  "/rasterizer/javascripts/rasterizer-BDY3LGYT.js.map",
  "/rasterizer/javascripts/rasterizer-BDY3LGYT.js",
  "/rasterizer/stylesheets/index-MZLIHPAP.css.map",
  "/rasterizer/stylesheets/index-MZLIHPAP.css",
  "/rasterizer/images/icon-152-6DQCR3CF.png",
  "/rasterizer/images/icon-167-K336LADP.png",
  "/rasterizer/images/icon-180-F6MFMNLG.png",
  "/rasterizer/images/icon-192-6RUJKB54.png",
  "/rasterizer/images/icon-512-SIO5R3AK.png",
  "/rasterizer/index.html",
  "/rasterizer/"
];

self.addEventListener('install', async (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => {
    return cache.addAll(urls);
  }))
})

const clearPreviousCaches = async () => {
  let keys = await caches.keys()
  keys = keys.filter((key) => {
    return (key != cacheName) && key.startsWith(prefix)
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
    caches.open(cacheName).then((cache) => {
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

(function() {
  var $cacheName, $prefix, $urls, clearPreviousCaches, tag;

  tag = '1';

  $prefix = 'RASTERIZER';

  $cacheName = `${$prefix}-${tag}`;

  $urls = ['/rasterizer/bundle.ed49ff0ac6940f8038e8.js', '/rasterizer/javascripts/rasterizer.fc24574b7555656d7cf5.js', '/rasterizer/stylesheets/index.807cc4522f36c1b97901.css', '/rasterizer/images/icon-152.e32b66be0ef69d4a3f4a.png', '/rasterizer/images/icon-167.771210605436c9a8ddfc.png', '/rasterizer/images/icon-180.161e5717866bbd291345.png', '/rasterizer/images/icon-192.93fb574989386d5f7756.png', '/rasterizer/images/icon-512.f8320492a7d062b44d8c.png', '/rasterizer/pwa.991c33f466a5746c6c43.js', '/rasterizer/manifest.webmanifest', '/rasterizer/index.html', '/rasterizer/'];

  self.addEventListener('install', function(event) {
    return event.waitUntil(caches.open($cacheName).then(function(cache) {
      return cache.addAll($urls);
    }));
  });

  clearPreviousCaches = function() {
    return caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(key) {
        return (key !== $cacheName) && key.startsWith($prefix);
      }).map(function(key) {
        return caches.delete(key);
      }));
    });
  };

  self.addEventListener('activate', function(event) {
    return event.waitUntil(clearPreviousCaches());
  });

  self.addEventListener('fetch', function(event) {
    return event.respondWith(caches.open($cacheName).then(function(cache) {
      return cache.match(event.request, {
        ignoreSearch: true
      });
    }).then(function(response) {
      return response || fetch(event.request);
    }));
  });

  self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
      return self.skipWaiting();
    }
  });

}).call(this);

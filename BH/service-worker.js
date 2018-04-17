const VERSION = 'v3';
const preCacheName = 'version3',
    preCacheFiles = [
        '/',
        '/receipts',
        //'./index.html',
        //'home/layout.html',
        //'home/landing.html',
        './scripts/app/service-worker-register.js'
    ];
function log(message, description) {
    //const debugThis = false;
    /*debugThis && */(description !== null) && console.log(VERSION, message, description);
                     (description === null) && console.log(VERSION, message);
}

self.addEventListener('install', (e) => {
    log('version is installed.');
    caches.open(preCacheName).then(cache => cache.addAll(preCacheFiles));
})

self.addEventListener('active', () => {
    log('version is activated.');
})
self.addEventListener('fetch', (e) => {
    log('[ServiceWorker] Fetching', e.request.url);
    e.respondWith(
        caches.match(e.request).then(response => {
            if (!response) {
                log('[ServiceWorker] No response from fetch',e.request.url);
                return fetch(e.request);
            }

            return response;
        })
        )
})
self.addEventListener('onupdatefound', () => {
    log('version is updated.');
})
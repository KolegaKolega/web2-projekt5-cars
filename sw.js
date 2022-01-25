importScripts('/idb.js');
importScripts('/utility.js');

const CACHE_STATIC_NAME = 'static-v9';
const STATIC_FILES = [
    "/",
    "/manifest.json",
    "/index.html",
    "/offline.html",
    "/404.html",
    "/post.html",
    "/src/js/app.js",
    "/src/images/koenigsegg-agera.jpg",
    "/src/images/hennessey-venom-f5.jpg"
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing Service Worker... ', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function(cache){
                console.log('[Service Worker] Precaching App Shell');
                return cache.addAll(STATIC_FILES);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating Service Worker... ', event);
    event.waitUntil(
        caches.keys()
            .then(function(keyList) {
                return Promise.all(keyList.map(function(key) {
                    if(key !== CACHE_STATIC_NAME){
                        console.log('Removing old cache', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request)
                        .then(function(res) {
                            if(res.status === 404){
                                return caches.match('/404.html')
                            }
                            return res
                        })
                        .catch(function(err) {
                            return caches.open(CACHE_STATIC_NAME)
                                .then(function(cache) {
                                    return cache.match('/offline.html');
                                });
                        });
                }
            })
    );
});

self.addEventListener('sync', function(event) {
    console.log('[Service Worker] Background syncing', event);
    if (event.tag === 'sync-new-posts') {
        console.log('[Service Worker] Syncing new Posts');
        event.waitUntil(
            readAllData('sync-posts')
                .then(function(data) {
                    for (const dt of data) {
                        console.log("from indexdb: " + dt.name)

                        fetch('/saveCars', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: dt.id,
                                name: dt.name,
                                speed: dt.speed
                            })
                        })
                            .then(function(res) {
                                console.log('Sent data', res);
                                if (res.ok) {
                                    deleteItem('sync-posts', dt.id); // Isn't working correctly!
                                }
                            })
                            .catch(function(err) {
                                console.log('Error while sending data', err);
                            });
                    }

                })
        );
    }
});


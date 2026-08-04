// Service Worker de Life Tracker
// Sube este archivo a la MISMA carpeta que tu index.html en GitHub.
// GitHub Pages lo sirve como un archivo real (mismo origen), por lo que
// el navegador SÍ permite registrarlo (a diferencia de un blob: URL).

const CACHE_NAME = 'life-tracker-cache-v1';

// Al instalar, activamos este SW de inmediato sin esperar a que se cierren
// las demás pestañas abiertas de la app.
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Al activarse, tomamos el control de la página inmediatamente y limpiamos
// versiones de caché antiguas si en el futuro cambias CACHE_NAME.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Estrategia: intentar red primero; si falla (sin conexión), usar la copia
// guardada en caché. Cada página/recurso visitado se va guardando en caché
// automáticamente para poder reabrirse sin internet.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Guardamos una copia en caché de las respuestas exitosas (GET)
                if (event.request.method === 'GET' && response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('scripts/app/service-worker.js', {
        scope: '/'
    })
    .then(registration => {
        console.log('service worker registration completed.');
    }, (err) => {
        console.log('Service Worker registration failed: ', err);
    })
}
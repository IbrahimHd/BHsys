if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js', {
        scope: './' //what range of URLs a service worker can control (leave it off to make it applicable to all/root)
        //'Service-Worker-Allowed': './scripts/app/'
    })
    .then(registration => {
        console.log('service worker registration completed.', registration);
        if (registration.installing) {
            registration.installing.postMessage("Howdy from your installing page.");
        }
    })
    .catch(err => {
        console.log('Service Worker registration failed: ', err);
    });
} else {
    console.warn('Service workers are not supported.');
}
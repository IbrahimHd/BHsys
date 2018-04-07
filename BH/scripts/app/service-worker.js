const VERSION = 'v1';
function log(message) {
    console.log(VERSION, message);
}

self.addEventListener('install', () => {
    log('version is installed.');
})

self.addEventListener('active', () => {
    log('version is activated.');
})
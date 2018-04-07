
var browserSync = BrowserSync.create();

browserSync.init({
    //server: ["app"],
    proxy: "http://bhsys.com",
    files: ["css/*.css"],
    plugins: [
        {
            module: "bs-html-injector",
            options: {
                files: ["app/*.html"]
            }
        }
    ],
    open: false,
    logLevel: 'debug'
});
/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 |
 | There are more options than you see here, these are just the ones that are
 | set internally. See the website for more info.
 |
 |To use it, in the same directory run: browser-sync start --config bs-config.js
 */
module.exports = {
    server:'.', //'BH',
    host: 'bhsys.com', //"bhsys.com:8080"
    https:true,
    //port:443, //3000
    online: true,
    //open: 'external', //false    
    files: ["**/*.css", "**/*.js"],
    plugins: [
        {
            module: "bs-html-injector",
            options: {
                files: [
                    "**/*.html",
                    "scripts/app/*.js",
                    "scripts/app/**/*.js",
                ],
                restrictions: ['#header', '#footer'],
                excludedTags: ["aside"]
            }
        }
    ],
    logLevel: 'info', //'debug' 'silent'
    //middleware: function (req, res, next) {
    //    res.setHeader('Access-Control-Allow-Origin', '*');
    //    res.setHeader('set-cookie', 'name=value');
    //    next();
    //}
};
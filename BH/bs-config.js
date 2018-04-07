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
    //**********************************************************************
    //*************** WORKS ONLY WHEN IT'S CONNECTED TO A NETWORK **********
    //**********************************************************************
    proxy: 'https://bhsys.com', //'localhost', //'127.0.0.1', // "https://bhsys.com:8080",
    //host: '127.0.0.1', //"bhsys.com:8080", //"bhsys.com:8080",
    https:true,
    //port:8080, //3000
    online: true,
    //open: 'external', //false
    reloadDelay: 0,
    files: ['**/*.css', '**/*.js'],
    plugins: [
        {
            module: 'bs-html-injector',
            options: {
                files: [
                    '**/*.html'
                ],
                restrictions: ['#header', '#footer'],
                excludedTags: ['aside']
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
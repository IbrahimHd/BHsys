/// <reference path="../libs/uglifyjs.js" />

var fs = require('fs'),
    uglifyJs = require('uglify-es');
  //uglifyJs = require('uglify-js');
//var UglifyJS = require("uglify-js2")

//'directives/directive_ALL_receipt.js'
//'../../mapDir/geojson-lbn.js'
var fileStructure = [
    //{
    //    name: 'cssStyle',
    //    sourceFiles: ['css/style.css'],
    //    dist: 'css/style.min.css'
    //},
    //{
    //    name: 'uiRouter',
    //    sourceFiles: ['scripts/libs/angular-ui-route/ui-router-core.min.js', 'scripts/libs/angular-ui-route/ui-router-angularjs.min.js', 'scripts/libs/angular-ui-route/ui-router-sticky-states.js', 'scripts/libs/angular-ui-route/ui-router-dsr.min.js'],
    //    dist: 'scripts/libs/angular-ui-route/ui-router_BUNDLE.min.js'
    //},
    //{
    //    name: 'crypto',
    //    sourceFiles: ['scripts/libs/crypto-js/core-min.js', 'scripts/libs/crypto-js/hmac-min.js', 'scripts/libs/crypto-js/sha256-min.js', 'scripts/libs/crypto-js/enc-base64-min.js'],
    //    dist: 'scripts/libs/crypto-js/crypto_BUNDLE.min.js'
    //},
    {
        name: 'security',
        sourceFiles: ['scripts/app/security/securityManager.js', 'scripts/app/security/authService.js', 'scripts/app/security/authNotifyService.js', 'scripts/app/security/routerSecurity.js', 'scripts/app/security/authInterceptor.js'],
        dist: 'scripts/app/security/security_BUNDLE.min.js'
    },
    //{
    //    name: 'directive_common_BUNDLE',
    //    sourceFiles: ['common/floatMenu/floatMenu.js', 'common/spinKit/spinKit.js', 'scripts/app/directives/button-spinner.js', 'scripts/app/directives/includeSameScope.js', 'scripts/app/filters.js'],
    //    dist: 'scripts/app/directives/directive_common_BUNDLE.min.js'
    //},   
    //{
    //    name: 'receipt',
    //    sourceFiles: ['receiptDir/receiptService.js', 'receiptDir/receiptCtrl.js'],
    //    dist: 'receiptDir/receipt_BUNDLE.min.js'
    //},
    //{
    //    name: 'directive_receipt',
    //    sourceFiles: ['scripts/app/directives/inputFormatDirective.js', 'scripts/app/directives/onLongPress.js', 'scripts/app/directives/setFocus.js', 'scripts/app/directives/ihInput/ihInput.js', 'scripts/app/nbrToWordsFltr.js'],
    //    dist: 'scripts/app/directives/directive_receipt_BUNDLE.min.js'
    //},    
    //{
    //    name: 'viz',
    //    sourceFiles: [  'scripts/libs/d3/d3.min.js',
    //                    'scripts/libs/dc/crossfilter.js',
    //                    'scripts/libs/dc/reductio.min.js',
    //                    'scripts/libs/dc/dc.min.js',
    //                    'scripts/libs/leaflet/leaflet.min.js',
    //                    'scripts/libs/leaflet/leaflet.markercluster.min.js',
    //                    'scripts/libs/dc/dc.leaflet/dc.leaflet.min.js',
    //                    'mapDir/geojson-lbn.min.js',
    //                    'home/vizCtrl.js'
    //    ],
    //    dist: 'home_viz_BUNDLE.min.js'
    //}
];
var outputFiles = [];

function minify(filesbundleContent) {
    result = uglifyJs.minify(filesbundleContent);
    if (result.error) {
        console.error('Error in minifying files:', result.error);
        return false;
    }
    return result;
}

function readFileFn(filePath) {
    console.log('> Trying to read file content "' + filePath + '" ...');
    try {
        return fs.readFileSync(filePath, 'utf8');
    }
    catch (exception) {
        throw exception;
    }
}

function wirteFileFn(code, outputFileName) {
    //fs.writeFile(outputFileName, code, function (err) {if(err)...
    console.log('> Trying to Write "' + outputFileName + '" ...');
    try {
        fs.writeFileSync(outputFileName, code, 'utf8');
    }
    catch (exception) {
        throw exception;
    }
}

fileStructure.forEach(bundle => {
    //console.log(bundle.name + ':');
    //outputFiles['name'] = bundle.name;
    //for (var i=0; i <= bundle.sourceFiles.length; i++){
    //    console.log(bundle.sourceFiles[i]);
    //    outputFiles.name = bundle.name;
    //}
    //outputFiles[bundle.name]['content']
    var bundleContent = bundle.sourceFiles.map(function (filePath) {
        try {
            return readFileFn(filePath);
        }
        catch (exception) {
            console.log('Error in reading file: ', exception);
        }
    });

    var minifiedResult = minify(bundleContent/*, { mangle: { reserved: ['<', '>'] } }*/);
    if (minifiedResult.code) {
        try{
            wirteFileFn(minifiedResult.code, bundle.dist);

        }
        catch(exception){
            console.log('Error in writing file: ', exception);
        }
    }
}
);
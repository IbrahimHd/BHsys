/// <reference path="../angular/angular.min.js" />

(function () {
    'use strict';

    angular
        .module('imgHandler', [])
        .controller('imgHandlerCtrl', imgHandlerCtrl)
        .directive('imgHandler', imgHandler)
    function imgHandler($parse, Upload) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                img: '=',
                imgName: '=',
                showUploadBtn: '@?',
                onChange: '&?',
                api: '=?'
            },
            templateUrl: 'scripts/libs/imgHandler/imgHandler.html',
            controller:'imgHandlerCtrl',
            link: function postLink(scope, elm, attrs, ctrl) {
                var inputImg = scope.img;
                if (angular.isString(inputImg)) {
                    Upload.urlToBlob(inputImg).then(function(blob) {scope.imgModel = blob;});
                } else {
                    scope.imgModel = inputImg;
                }
                /* set defulat to TRUE */
                scope.showUpload = !angular.isDefined(scope.showUploadBtn) ? true : (scope.showUploadBtn.toLowerCase() === "true");
                scope.onChange = $parse(scope.onChange);
            }
        }
    }
    imgHandler.$inject=['$parse', 'Upload'];

    imgHandlerCtrl.$inject = ['$scope', '$http', '$timeout', 'WebcamService', 'Upload'];

    function imgHandlerCtrl($scope, $http, $timeout, WebcamService, Upload) {
        $scope.closeImgPanel = function () {
            $scope.cancelCrop(); $scope.toggleWebcam(); $scope.showWebcam = false; $scope.showImageCrop = false;
            $timeout(function () { $scope.showCamAndCrop = false; }, 100);
            $timeout(function(){$scope.showCamAndCropFrame = false;},1000);           
        }

        /* Set the default values for ngf-select and ngf-drop directives*/
        Upload.setDefaults({ ngfMaxSize: 10240 });

        $scope.uploadImg = function (options) {
            var formData = new FormData();
            var fileName = angular.isDefined(options.imgName) ? options.imgName : $scope.imgName;
            formData.set("file", $scope.imgModel, fileName);
            return $http.post( options.url , formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }

        $scope.api = {
            uploadImg: $scope.uploadImg
        }

        $scope.isObjectEmpty = function (object) { return Object.keys(object).length === 0; }

        $scope.$watch('imgModel', function (newValue, oldValue) {
            if (oldValue != null && newValue && newValue != oldValue) {
                $scope.onChange(); console.log('imgChaaaaaaaaaaange');
            }
        });

        function dataURItoBlob(dataURI) {
            var byteString = atob(dataURI.split(',')[1]);
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            var blob = new Blob([ab], { type: mimeString });
            return blob;
        }
        $scope.imgModelOriginal = $scope.imgModel;
        $scope.showWebcam = false;
        $scope.webcam = WebcamService.webcam;
        $scope.croppedImageUri = null;

        $scope.toggleWebcam = function () {
            if ($scope.webcam && $scope.webcam.isTurnOn === true)
                $scope.webcam.turnOff();
            $scope.showWebcam = !$scope.showWebcam;
        }

        //override function for be call when capture is finalized
        $scope.webcam.success = function (image, type) {
            $scope.imgModel = dataURItoBlob('data:' + type + ';base64,' + image);
            $scope.imageForCrop = null
            $scope.showWebcam = false;
        }
        $scope.webcam.onError = function (err) {
            console.log('Error happened with the webCam. ',err)
        }
        //............................

        $scope.sendImageForCrop = function (img) {
            $scope.imageForCrop = img; //angular.extend({}, img) //angular.copy(img);
        }

        $scope.cancelCrop = function () {
            $scope.imgModel = $scope.imageForCrop; //angular.extend({}, $scope.imageForCrop); //angular.copy($scope.imageForCrop)
            //$scope.imageForCrop = null; //this is for closing imageCrop frame
        }

        $scope.resetImgModel = function () {
            $scope.imgModel = $scope.imgModelOriginal; //angular.extend({}, $scope.imageForCrop); //angular.copy($scope.imageForCrop)
            //$scope.imageForCrop = null; //this is for closing imageCrop frame
        }

        $scope.$watch('croppedImageUri', function (newValue, oldValue) {
            //console.log('cropOld: ', oldValue); console.log('cropNew: ', newValue);
            if (oldValue && newValue != oldValue) {
                //console.log('crrrrrrrrrrrrrrrop');
                $scope.imgModel = dataURItoBlob($scope.croppedImageUri);
            }
        });
    }
})();
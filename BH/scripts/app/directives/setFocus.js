//http://stackoverflow.com/questions/14833326/how-to-set-focus-on-input-field

(function(){
    'use strict';
    angular.module('app')
    .directive('setFocus', setFocus);
    setFocus.$inject = ['$timeout','$parse'];
    function setFocus($timeout, $parse) {
        return {
            //scope: { trigger: '=setFocus' },
            //link: function (scope, element) {
            //    console.log('foccussss');
            //    scope.$watch('trigger', function (value) {
            //        if (value === true) {
            //            console.log('trigger', value);
            //            $timeout(function () {
            //                element[0].focus();
            //                scope.trigger = false;
            //            });
            //        }
            //    });

            link: function (scope, element, attrs) {
                scope.$watch(attrs.setFocus, function (value) {
                    if (value === true) {
                        $timeout(function() {
                            element[0].focus();
                            element[0].select();
                            scope[attrs.setFocus] = false;
                        });
                    }
                });

                //set attribute value to 'false' on blur event:
                var model = $parse(attrs.setFocus);
                element.bind('blur', function () {
                    // scope.$apply(model.assign(scope, false)); // this does not work if the injected value is a FUNCTION
                });
            }
        }
    };
})();
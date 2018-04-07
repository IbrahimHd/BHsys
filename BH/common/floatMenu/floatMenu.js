(function () {
    'use strict';

    angular
        .module('app')
        .directive('floatMenu', floatMenu);

    floatMenu.$inject = ['$document'];

    function floatMenu($document) {
        return {
            restrict: 'A',
            templateUrl: 'common/floatMenu/_floatMenu.html',
            link: function (scope, element, attrs) {
                scope.isFloatMenuOpen = false;

                // Bind click events outside directive to close edit popover
                $document.on('mousedown', function (e) {
                    if (scope.isFloatMenuOpen && !element[0].contains(e.target)) {
                        scope.$apply(function () {
                            scope.isFloatMenuOpen = !scope.isFloatMenuOpen;
                        });
                    }
                });
            }
        }
    }
})();
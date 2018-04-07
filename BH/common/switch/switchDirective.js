
(function () {
    "use strict";

    angular
        .module('app')
        .directive('ihSwitch', switchDirective);
    function switchDirective() {
        var templateDOM =
        + ' <span class="ih-switch">'
        + '     <input id="{{id}}"'
        + '            class="cmn-toggle cmn-toggle-round-flat"'
        + '            type="checkbox"'
        + '            ng-model="modelName"'
        + '            ng-change="onChange()">'
        + '     <label for="{{id}}">{{modelName ? textIfChecked : textIfUnchecked}}</label>'
        + ' </span>';

        return {
            restrict: 'AE',
            replace:true,
            template:templateDOM, //'common/switch/switch.html',
            scope: {
                modelName: '=',
                onChange: '&',
                textIfChecked: '=',
                textIfUnchecked: '='
            },
            link: function (scope, element, attrs) {
                scope.id = 'switch-' + scope.$id;
                //console.log(scope.$id, scope.modelName); 
                //console.log(scope.modelName, typeof scope.modelName);
                //scope.ngModel = !!scope.modelName;
                //scope.ngModel = scope.modelName=='true';
            }
        }
    }
} ());
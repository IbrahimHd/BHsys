(function () {
    "use strict";

    angular
        .module('app')
        .directive('spinKit',spinKit);
        function spinKit () {     
            return {
                restrict: 'AE',
                template: 
                    "<div class=\"sk-three-bounce\">"+
                        "<div class=\"sk-child sk-bounce1\"></div>"+
                        "<div class=\"sk-child sk-bounce2\"></div>"+
                        "<div class=\"sk-child sk-bounce3\"></div>"+
                    "</div>"
            }
    };
} ());
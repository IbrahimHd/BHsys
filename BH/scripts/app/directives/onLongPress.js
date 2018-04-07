//http://www.lazyentropy.com/blog/2015/03/18/hold-button-angular-js.html

(function(){
    'use strict';
    angular.module('app')
    .directive('holdButton', holdButton);
    holdButton.$inject = ['$interval', '$q', '$parse'];
    function holdButton($interval,$q, $parse) {
        return {
            restrict: 'A',
            priority: 10,
            link: function postLink(scope, element, attrs) {
                //The framerate of the progress bar, progression will be evaluated every 5ms.  
                var tickDelay = 10;

                var deferred, stop;
                element.on('mousedown', function($event) {
                    var onHoldStart = $parse(attrs.holdButton);
                    var holdDelay = attrs.holdButtonDelay ? ($parse(attrs.holdButtonDelay)(scope) || 400) : 400;
                    var counter = 0;
                    var nbTick = holdDelay / tickDelay;
                    deferred = $q.defer();

                    // Call the onTick function `nbTick` times every `tickDelay` ms.
                    // stop is the stopper function 
                    stop = $interval(onTick, tickDelay, nbTick);
                    function onTick() {
                        counter++;
                        deferred.notify((counter + 1) / nbTick);
                        // If we reach `nbTick` the resolve the promise
                        if (counter === nbTick) {
                            deferred.resolve();
                        }
                    }

                    if (typeof onHoldStart == 'function' || false) {
                        // The function passed as directive parameter is passed the special parameter `$promise`
                        // which is the promise resolved after the hold is completed. 
                        onHoldStart(scope, {
                            $promise: deferred.promise,
                            $event: $event
                        });
                    }
                });
                element.on('mouseup', function($event) {
                    $event.stopPropagation();
                    $interval.cancel(stop);
                    //At mouseup we reject the defered if it existed. This happens if the hold is not completed. 
                    if (deferred) {
                        deferred.reject($event);
                    }
                })
            }
        };
    };
})();
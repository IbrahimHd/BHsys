// https://github.com/g1eb/angular-datetime-range
// v0.2.12

'use strict';

angular.module('datetimePicker', []).
  directive('datetimeRange', ['$document', '$timeout', function ($document, $timeout) {

     return {
      restrict: 'AE',
      scope: {
          start: '=',
          end: '=',
          presets: '=?',
          onChange: '&?',
          onChangeStart: '&?',
          onChangeEnd: '&?',
          onClose: '&?',
          },
      replace: true,
      templateUrl: 'scripts/libs/datetimePicker/datetime-range.html',
      compile: function () {
          return {
              pre: function preLink() {},
              post: function postLink(scope, element) {

                  // Get current date
                  scope.current = moment();

                  // Convert start datetime to moment.js if its not a moment object yet
                  if ( scope.start && !scope.start._isAMomentObject ) {
                      scope.start = moment(scope.start);
                  }

                  // Convert end datetime to moment.js if its not a moment object yet
                  if ( scope.end && !scope.end._isAMomentObject ) {
                      scope.end = moment(scope.end);
                  }

                  // Get number of weeks in month
                  scope.getNumWeeks = function () {
                      if (!scope.calendar) { return; }
                      //console.log(Math.floor(scope.calendar.clone().endOf('month').endOf('week').diff(scope.calendar.clone().startOf('month').startOf('week'), 'days') / 7) + 1)
                      return Math.floor(scope.calendar.clone().endOf('month').endOf('week').diff(scope.calendar.clone().startOf('month').startOf('week'), 'days') / 7) + 1;
                  }

                  // Set selected date
                  scope.selectDate = function (date) {
                      if ( scope.selected === date ) {
                          scope.selected = undefined;
                      } else {
                          scope.selected = date;
                          scope.calendar = scope.selected.clone();
                          scope.presetsActive = false;
                      }
                  };

                  // Update selected date
                  scope.setDate = function (date, calendar_update) {
                      if ( scope.selected.isSame(date) ) { return; }
                      if ( ( scope.selected === scope.start && date < scope.end ) || ( scope.selected === scope.end && date > scope.start ) ) {
                          scope.selected.year(date.year()).month(date.month()).date(date.date()).hours(date.hours()).minutes(date.minutes()).seconds(date.seconds());
                          if ( (scope.selected.clone().startOf('week').month() !== scope.calendar.month() && scope.selected.clone().endOf('week').month() !== scope.calendar.month()) || calendar_update ) {
                              scope.calendar = scope.selected.clone();
                          }
                          if ( scope.selected === scope.start ) {
                              scope.callbackStart();
                          }
                          if ( scope.selected === scope.end ) {
                              scope.callbackEnd();
                          }
                          scope.callbackAll();
                      } else {
                          scope.warning = ( scope.selected === scope.start ) ? 'end' : 'start';
                          $timeout(function () {
                              scope.warning = undefined;
                          }, 250);
                      }
                  };

                  // Set start and end datetime objects to the selected preset
                  scope.selectPreset = function (preset) {
                      // Hide presets menu on select
                      scope.close();

                      // Don't do anything if nothing is changed
                      if ( scope.start.isSame(preset.start) && scope.end.isSame(preset.end) ) { return; }

                      // Update start datetime object if changed
                      if ( !scope.start.isSame(preset.start) ) {
                          scope.start = preset.start.clone();
                          scope.callbackStart();
                      }

                      // Update end datetime object if changed
                      if ( !scope.end.isSame(preset.end) ) {
                          scope.end = preset.end.clone();
                          scope.callbackEnd();
                      }

                      // Something has definitely changed, fire ambiguous callback
                      scope.callbackAll();
                  };

                  // Callbacks fired on change of start datetime object
                  scope.callbackStart = function () {
                      if ( !!scope.onChangeStart ) {
                          $timeout(function () {
                              scope.onChangeStart();
                          });
                      }
                  };

                  // Callbacks fired on change of end datetime object
                  scope.callbackEnd = function () {
                      if ( !!scope.onChangeEnd ) {
                          $timeout(function () {
                              scope.onChangeEnd();
                          });
                      }
                  };

                  // Callbacks fired on change of start and/or end datetime objects
                  scope.callbackAll = function () {
                      if ( !!scope.onChange ) {
                          $timeout(function () {
                              scope.onChange();
                          });
                      }
                  };

                  // Close edit popover
                  scope.close = function () {
                      scope.selected = '';
                      scope.presetsActive = false;
                      scope.calendarActive = false;

                      if ( !!scope.onClose ) {
                          scope.onClose();
                      }
                  }

                  // Bind click events outside directive to close edit popover
                  $document.on('mousedown', function (e) {
                      if ( !element[0].contains(e.target) && (!!scope.presetsActive || !!scope.selected) ) {
                          scope.$apply(function () {
                              scope.close();
                          });
                      }
                  });

                  // Bind 'esc' keyup event to close edit popover
                  $document.on('keyup', function (e) {
                      if ( e.keyCode === 27 && (!!scope.presetsActive || !!scope.selected) ) {
                          scope.$apply(function () {
                              scope.close();
                          });
                      }
                  });
              }
          };
      }
     };
  }]);

//Datetime v0.1.28
angular.module('datetimePicker').
    directive('datetimeInput', ['$document', '$timeout', function ($document, $timeout) {
        return {
            restrict: 'E',
            scope: {
                datetime: '=',
                format: '=?',
                dateFormat: '=?',
                timeFormat: '=?',
                minDate: '=?',
                maxDate: '=?',
                hourStep: '=?',
                minuteStep: '=?',
                secondStep: '=?',
                onChange: '&',
                placeholder: '@',
                cssClass: '@',
            },
            replace: true,
            templateUrl: 'scripts/libs/datetimePicker/datetime-input.html',
            compile: function () {
                return {
                    pre: function preLink() { },
                    post: function postLink(scope, element) {

                        // Get current date
                        scope.current = moment();

                        // Convert datetime object to moment.js if its not a moment object yet
                        if (scope.datetime && !scope.datetime._isAMomentObject) {
                            scope.datetime = moment(scope.datetime, scope.format);
                        }

                        // Toggle edit popover
                        scope.toggleEditPopover = function () {
                            if (!!scope.selected) {
                                scope.selected = undefined;
                            } else {
                                scope.selected = scope.datetime || moment();
                                scope.calendar = scope.selected.clone();
                            }
                        };

                        // Update selected date
                        scope.update = function (datetime, calendar_update) {
                            if (scope.selected.isSame(datetime) && !!scope.datetime) { return; }
                            if (!datetime) {
                                scope.selected = scope.datetime = undefined;
                            } else if ((!scope.minDate || datetime > scope.minDate) && (!scope.maxDate || datetime < scope.maxDate)) {
                                scope.selected.year(datetime.year()).month(datetime.month()).date(datetime.date()).hours(datetime.hours()).minutes(datetime.minutes()).seconds(datetime.seconds());
                                if ((scope.selected.clone().startOf('week').month() !== scope.calendar.month() && scope.selected.clone().endOf('week').month() !== scope.calendar.month()) || calendar_update) {
                                    scope.calendar = scope.selected.clone();
                                }
                                if (!scope.datetime) {
                                    scope.datetime = scope.selected;
                                }
                                scope.$$postDigest(function () {
                                    scope.onChange();
                                });
                            } else {
                                scope.warning = true;
                                $timeout(function () {
                                    scope.warning = false;
                                }, 250);
                            }
                        };

                        // Close edit popover
                        scope.close = function () {
                            scope.selected = '';
                            scope.calendar_active = false;
                        }

                        // Bind click events outside directive to close edit popover
                        $document.on('mousedown', function (e) {
                            if (!!scope.selected && !element[0].contains(e.target)) {
                                scope.$apply(function () {
                                    scope.close();
                                });
                            }
                        });
                    }
                };
            }
        };
    }]);

//-------------------------------------------------------------------------------------
// v0.1.25
angular.module('datetimePicker').
    directive('dateInput', ['$document', '$timeout', function ($document, $timeout) {
    return {
        restrict: 'E',
        scope: {
            date: '=',
            format: '=?',
            minDate: '=?',
            maxDate: '=?',
            onChange: '&',
            placeholder: '@',
            cssClass: '@',
        },
        require: '?ngModel',
        replace: true,
        templateUrl: 'scripts/libs/datetimePicker/date-input.html',
        compile: function () {
            return {
                pre: function preLink() { },
                post: function postLink(scope, element, attrs, ngModel) {
                    if (!ngModel) return; // do nothing if no ng-model

                    // Specify how UI should be updated
                    ngModel.$render = function () {
                        scope.date = ngModel.$viewValue;
                        if (!!scope.selected) {
                            scope.selected = ngModel.$viewValue;
                        }
                        //element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
                    };

                    // Get current date
                    scope.current = moment();

                    // Convert date object to moment.js if its not a moment object yet
                    if (scope.date && !scope.date._isAMomentObject) {
                        scope.date = moment(scope.date, scope.format);
                    }

                    // Toggle edit popover
                    scope.toggleEditPopover = function () {
                        if (!!scope.selected) {
                            scope.selected = undefined;
                        } else {
                            scope.selected = scope.date || moment();
                            scope.calendar = scope.selected.clone();
                        }
                    };

                    // Update selected date
                    scope.update = function (datetime, calendar_update) {
                        if (scope.selected.isSame(datetime) && !!scope.date) { return; }
                        if (!datetime) {
                            scope.selected = scope.date = undefined;
                        } else if ((!scope.minDate || datetime > scope.minDate) && (!scope.maxDate || datetime < scope.maxDate)) {
                            scope.selected.year(datetime.year()).month(datetime.month()).date(datetime.date()).hours(datetime.hours()).minutes(datetime.minutes()).seconds(datetime.seconds());
                            if (scope.selected.clone().startOf('week').month() !== scope.calendar.month() || calendar_update) {
                                scope.calendar = scope.selected.clone();
                            }
                            if (!scope.date) {
                                scope.date = scope.selected;
                                ngModel.$setViewValue(scope.date);
                            }
                            scope.$$postDigest(function () {
                                scope.onChange();
                            });
                            scope.close();
                        } else {
                            scope.warning = true;
                            $timeout(function () {
                                scope.warning = false;
                            }, 250);
                        }
                    };

                    // Close edit popover
                    scope.close = function () {
                        scope.selected = '';
                        scope.calendar_active = false;
                    }

                    // Bind click events outside directive to close edit popover
                    $document.on('mousedown', function (e) {
                        if (!!scope.selected && !element[0].contains(e.target)) {
                            scope.$apply(function () {
                                scope.close();
                            });
                        }
                    });
                }
            };
        }
    };
    }]);

// Scroll up directive v0.2.12
angular.module('datetimePicker').
  directive('scrollUp', function () {
      return {
          restrict: 'A',
          compile: function () {
              return {
                  pre: function preLink() { },
                  post: function postLink(scope, element, attrs) {
                      element.bind('mousewheel wheel', function (ev) {
                          ev = ev.originalEvent || ev;
                          var delta = ev.wheelDelta || (-1 * ev.deltaY) || 0;
                          if (delta > 0) {
                              scope.$apply(function () {
                                  scope.$eval(attrs.scrollUp);
                              });
                              ev.preventDefault();
                          }
                      });
                  }
              };
          }
      };
  });

// Scroll down directive v0.2.12
angular.module('datetimePicker').
  directive('scrollDown', function () {
      return {
          restrict: 'A',
          compile: function () {
              return {
                  pre: function preLink() { },
                  post: function postLink(scope, element, attrs) {
                      element.bind('mousewheel wheel', function (ev) {
                          ev = ev.originalEvent || ev;
                          var delta = ev.wheelDelta || (-1 * ev.deltaY) || 0;
                          if (delta < 0) {
                              scope.$apply(function () {
                                  scope.$eval(attrs.scrollDown);
                              });
                              ev.preventDefault();
                          }
                      });
                  }
              };
          }
      };
  });
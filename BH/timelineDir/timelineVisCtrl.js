/// <reference path="../scripts/libs/angular/angular.js"/>
/// <reference path="../scripts/app/dataService.js"/>
/// <reference path="../scripts/libs/visJS/vis-timeline-graph2d.min.js" />
/// <reference path="../scripts/libs/leaflet/leaflet.min.js" />

(function () {
    'use strict';
    angular
    .module("app")
    .controller("timelineVisCtrl", timelineVisCtrl);

    timelineVisCtrl.$inject = ['$scope', '$timeout'];

    function timelineVisCtrl($scope, $timeout)
    {
        var txtData = document.getElementById('data');
        var timelineGroups = new vis.DataSet([
            { id: 1, value: 1, content: 'Trak 1' },
            { id: 2, value: 2, content: 'Trak 2' },
            { id: 3, value: 3, content: 'Trak 3' },
        ]);

        // Create an empty DataSet.
        // This DataSet is used for two way data binding with the Timeline.
        $scope.items = new vis.DataSet();
        var container = document.getElementById('timeline');

        function loadDataTimeline() {
            var data = JSON.parse(txtData.value);
            $scope.items.add(data);
        }

        // load the initial data
        loadDataTimeline();

        var startTime = new Date('2017-01-01');
        var endTime = new Date(100 * 60 * 60 * 24 + (startTime).valueOf());

        var timelineOptions = {
            stack: true,
            start: startTime,
            end: endTime,
            editable: true,
            orientation: 'both',//top bottom
            groupEditable: true,
            groupOrder: function (a, b) {
                return a.value - b.value;
            },
            groupOrderSwap: function (a, b, groups) {
                var v = a.value;
                a.value = b.value;
                b.value = v;
            },
            groupTemplate: function (group) {
                var container = document.createElement('div');
                var label = document.createElement('span');
                label.innerHTML = group.content + ' ';
                container.insertAdjacentElement('afterBegin', label);
                var hide = document.createElement('i');
                //hide.innerHTML = 'hide';
                hide.className = 'fa fa-eye-slash';
                hide.style.fontSize = 'small';
                hide.addEventListener('click', function () {
                    timelineGroups.update({ id: group.id, visible: false });
                });
                container.insertAdjacentElement('beforeEnd', hide);
                return container;
            }
        };

        var timeline = new vis.Timeline(container, $scope.items, timelineGroups, timelineOptions);

        // Set custom time marker (blue)
        var startTimeForCustom = new Date(10 * 60 * 60 * 24 + (startTime).valueOf())
        timeline.addCustomTime(startTimeForCustom, 'timelineMarker');  //setCustomTime()

        timeline.fit();

        function handleDragStart(event) {
            event.dataTransfer.effectAllowed = 'move';
        //    console.log(angular.element(event.target));
            var draggedItem = JSON.parse(event.target.attributes['data'].nodeValue);
            var itemType = draggedItem.type; //event.target.innerHTML.split('-')[1].trim(); //event.target.attributes['ng-model'];
            var item = {
                id: new Date(),
                type: draggedItem.type,
                content: draggedItem.content
            };

            var isFixedTimes = (event.target.innerHTML.split('-')[2] && event.target.innerHTML.split('-')[2].trim() == 'fixed times')
            if (isFixedTimes) {
                item.start = new Date();
                item.end = new Date(1000 * 60 * 10 + (new Date()).valueOf());
            }

            event.dataTransfer.setData("text", JSON.stringify(item));
        }

        // wait a bit until the timeline is constructed
        $timeout(function () {
            var itemsDOM = document.querySelectorAll('.items .item');

            for (var i = itemsDOM.length - 1; i >= 0; i--) {
                var item = itemsDOM[i];

                item.addEventListener('dragstart', handleDragStart.bind(this), false);
            }
        }, 0)

        // function to make all groups visible again
         $scope.showAllGroups = function() {
            timelineGroups.forEach(function (group) {
                timelineGroups.update({ id: group.id, visible: true });
            })
        };
    }
})();
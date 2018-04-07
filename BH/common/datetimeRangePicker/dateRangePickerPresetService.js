(function () {
    'use strict';

    angular
        .module('app')
        .service('dateRangePickerPresetService', dateRangePickerPresetService);

    dateRangePickerPresetService.$inject = ['debugMode'];

    function dateRangePickerPresetService(debugMode) {
        var debugThis = false;
        var selft = this;

        this.dateRangePreset = function () {
            var ranges = [
                { 'id': 'today', 'name': 'اليوم', 'start': moment().startOf('day'), 'end': moment().endOf('day') },
                { 'id': 'yesterday', 'name': 'البارحة', 'start': moment().subtract(1, 'days').startOf('day'), 'end': moment().subtract(1, 'days').endOf('day') },
                { 'id': 'thisWeek', 'name': 'الأسبوع الحالي', 'start': moment().startOf('week'), 'end': moment().endOf('week') },
                { 'id': '7daysAgo', 'name': 'الأيام ال7 الأخيرة', 'start': moment().subtract(6, 'days').startOf('day'), 'end': moment().endOf('day') },
                { 'id': 'thisMonth', 'name': 'الشهر الحالي', 'start': moment().startOf('month'), 'end': moment().endOf('month') },
                { 'id': 'thisQuarter', 'name': 'الفصل الحالي', 'start': moment().startOf('quarter'), 'end': moment().endOf('quarter') },
                { 'id': 'thisYear', 'name': 'السنة الحالية', 'start': moment().startOf('year'), 'end': moment().endOf('year') },
                { 'id': 'lastYear', 'name': 'السنة الماضية', 'start': moment().subtract(1, 'year').startOf('year'), 'end': moment().subtract(1, 'year').endOf('year') },

            ];
            return ranges;
        };
    };
})();
(function () {
    'use strict';
    angular
        .module('app')
        .filter('nbrToWords',nbrToWords );
    function nbrToWords () {
            var th = ['', 'ألف', 'مليون', 'مليار', 'ترليون'];
            var dg = ['zero', 'واحد', 'إثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
            var tn = ['عشرة', 'إحدى عشر', 'اثنتا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
            var tw = ['عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];

            function isInteger(x) {
                x = x.replace(/[\, ]/g, ''); //remove digit separators
                return x % 1 === 0;
            }

            function toWords(s) {
                s = s.toString();
                s = s.replace(/[\, ]/g, '');
                if (s != parseFloat(s)) return 'not a number';
                var x = s.indexOf('.');
                if (x == -1) x = s.length;
                if (x > 15) return 'too big';
                var n = s.split('');
                var str = '';
                var sk = 0;
                for (var i = 0; i < x; i++) {
                    if ((x - i) % 3 == 2) {
                        if (n[i] == '1') {
                            str += tn[Number(n[i + 1])] + ' ';
                            i++;
                            sk = 1;
                        }
                        else if (n[i] != 0) {
                            str += 'و' + tw[n[i] - 2] + ' ';
                            sk = 1;
                        }
                    }
                    else if (n[i] != 0) {
                        str += 'و' + dg[n[i]] + ' ';
                        if ((x - i) % 3 == 0) str += 'مئة ';
                        sk = 1;
                    }


                    if ((x - i) % 3 == 1) {
                        if (sk) str += th[(x - i - 1) / 3] + ' ';
                        sk = 0;
                    }
                }
                if (x != s.length) { // for decimal places
                    var y = s.length;
                    str += 'point ';
                    for (var i = x + 1; i < y; i++) str += dg[n[i]] + ' ';
                }
                //str= str.replace(/\s+/g, ' ');   // << not needed for Arabic
                return 'فقط '+ str + ' ليرة لبنانية لا غير';

            }

            return function (value) {
                if (value && isInteger(value))
                    return toWords(value);

                return value;
            }
    }
})();
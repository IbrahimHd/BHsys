/* This improves code testability by allowing you to more easily know what the dependencies of your components are (avoids leaky abstractions).*/

/* global toastr:false, moment:false */
(function () {
    'use strict';

    angular
        .module('app')
        .constant('moment', moment)
        .constant('debugMode', true)
        .constant("api_file", "api/file/")
        .constant("msgConfirm", {
            msgConfirmCancel: {
                title: "<i class='fa fa-check-square-o'> تأكيد إلغاء الحفظ",
                message: "هل متأكد أنك تريد <b>إلغاء الحفظ</b>?",
                confirmText: "<i class='fa fa-check'></i> نعم",
                cancelText: "<i class='fa fa-arrow-right'></i> لا",
                placement: "right"
            },
            msgConfirmRemove: {
                title: "<i class='fa fa-check-square-o'> تأكيد الحذف",
                message: "هل متأكد أنك تريد <b>الحذف</b>?",
                confirmText: "<i class='fa fa-check'></i> نعم",
                cancelText: "<i class='fa fa-arrow-right'></i> لا",
                placement: "right"
            },
            msgConfirmDelete: {
                title: "<i class='fa fa-check-square-o'> تأكيد الحذف",
                message: "هل متأكد أنك تريد <b>الحذف دون إمكانية إسترجاعه لاحقاً</b>?",
                confirmText: "<i class='fa fa-check'></i> نعم",
                cancelText: "<i class='fa fa-arrow-right'></i> لا",
                placement: "right"
            }
        })
        .constant('formulas', {
            receiptItemTotalCost:
                '(receiptItem.itemQnty * receiptItem.itemCost) +' +
                '(receiptItem.itemPackageCount * receiptItem.itemPackageDeposit) +' +
                '(receiptItem.itemQnty * receiptItem.itemFreight) +' +
                '(receiptItem.itemQnty * receiptItem.itemLandingCost)'
        })
        /*Constants regarding user login defined here*/
        .constant('USER_ROLES', {
            all: '*',
            manager: 'manager',
            doctor: 'doctor',
            registrar: 'registrar'
        })
        .constant('AUTH_EVENTS', {
            loginSuccess: 'auth-login-success',
            loginFailed: 'auth-login-failed',
            logoutSuccess: 'auth-logout-success',
            sessionTimeout: 'auth-session-timeout',
            notAuthenticated: 'auth-not-authenticated',
            notAuthorized: 'auth-not-authorized'
        })
})();
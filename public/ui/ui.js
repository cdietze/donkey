'use strict';

angular.module('donkey', [])

    .factory('PingService', function ($http, $q) {
        return {
            ping: function (ip) {
                return $http.get('/ping/' + ip).then(function (response) {
                    return true;
                }, function (response) {
                    if (response.status == 404) {
                        return false;
                    } else {
                        return $q.reject("Request failed with status code " + response.status);
                    }
                });
            }
        };
    })

    .directive('dkPing', function (PingService, $timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var ip = attrs.dkPing;
                element.addClass("panel");
                var update = function () {
                    PingService.ping(ip).then(function (pingOk) {
                        element.toggleClass("panel-success", pingOk);
                        element.toggleClass("panel-warning", !pingOk);
                        element.removeClass("panel-danger");
                    }, function (error) {
                        element.addClass("panel-danger");
                    });
                    $timeout(update, 5000);
                };
                update();
            }
        };
    })

    .directive('dkPingLabel', function (PingService, $timeout) {
        return {
            restrict: 'E',
            replace: true,
            template: '<span>'+
                '<span class="label label-success pull-right" ng-show="pingState===\'online\'">Online</span>' +
                '<span class="label label-warning pull-right" ng-show="pingState===\'offline\'">Offline</span>'+
                '<span class="label label-danger pull-right" ng-show="pingState===\'error\'">Error</span>'+
                '</span>',
            scope: true,

            link: function (scope, element, attrs) {
                var ip = attrs.ip;
                var update = function () {
                    PingService.ping(ip).then(function (pingOk) {
                        scope.pingState = pingOk ? 'online' : 'offline';
                    }, function (error) {
                        scope.pingState = 'error';
                    });
                    $timeout(update, 5000);
                };
                update();
            }
        };
    })

    .directive('dkSwitchButtons', function () {
        return {
            restrict: 'E',
            template: '<div class="btn-group-vertical"><button class="btn btn-default" ng-click="setSwitch(true)">Turn on</button>' +
                '<button class="btn btn-default" ng-click="setSwitch(false)">Turn off</button></div>',
            scope: {
                code: '@'
            },
            replace: true,
            controller: function ($scope, $http) {
                $scope.setSwitch = function (state) {
                    $http.put('/switch/' + $scope.code + "?state=" + state).then(function () {
                        toastr.success('Switch request sent.');
                    });
                };
            }
        };
    })

    .
    controller('RootCtrl', function ($scope, $http, $timeout) {

        $scope.sonosItems = [
            {ip: "192.168.178.98", label: "Wohnzimmer (L)"},
            {ip: "192.168.178.64", label: "Wohnzimmer (R)"},
            {ip: "192.168.178.22", label: "Büro (L)", switchCode: "11111/2"},
            {ip: "192.168.178.24", label: "Büro (R)", switchCode: "11111/3"}
        ];

        $scope.wakeOnLan = function (macAddress) {
            $http.put('/wol/' + macAddress).then(function () {
                toastr.success('Wake up request sent.');
            });
        };

        $scope.switch = function (code, state) {
            $http.put('/switch/' + code + "?state=" + state);
        };
    });

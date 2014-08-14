'use strict';

angular.module('donkey', [])

    .factory('PingService', function ($http, $q) {
        return {
            /** pings the specified ip once and returns a promise that succeeds with true when the ping is successful */
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
            template: '<span>' +
                '<span class="label label-success pull-right" ng-show="pingState===\'online\'">Online</span>' +
                '<span class="label label-warning pull-right" ng-show="pingState===\'offline\'">Offline</span>' +
                '<span class="label label-danger pull-right" ng-show="pingState===\'error\'">Error</span>' +
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

/**
 * Renders two buttons: "Turn on" and "Turn off" which turn a switch on or off
 * If the optional attribute "switchState" is specified the switch request is sent repeatedly until the value of
 * switchState is equal to the requested state. Or until the maximum number of retries is sent (10 by default).
 *
 * Example:
 * <dk-switch-buttons code="11111/2" switchState="{{ switchState }}" label="Cooler"></dk-switch-buttons>
 */
    .directive('dkSwitchButtons', function ($timeout) {
        return {
            restrict: 'E',
            template: '<div class="btn-group-vertical"><button class="btn btn-default" ng-click="setSwitch(true)">Turn on</button>' +
                '<button class="btn btn-default" ng-click="setSwitch(false)">Turn off</button></div>',
            scope: {
                code: '@',
                switchState: '@',
                label: '@'
            },
            replace: true,
            controller: function ($scope, $http) {
                $scope.setSwitch = function (state) {
                    var retryIndex = 0;
                    var update = function () {
                        $http.put('/switch/' + $scope.code + "?state=" + state).then(function () {
                            toastr.success('Switch '
                                + (state ? 'on ' : 'off ')
                                + ($scope.label ? ($scope.label + ' ') : '')
                                + 'request ' + (retryIndex + 1) + ' sent.');
                            $timeout(function () {
                                if ($scope.switchState !== undefined && ($scope.switchState === "true") !== state) {
                                    retryIndex += 1;
                                    if (retryIndex >= 10) {
                                        toastr.error('Retried to set switch ' + retryIndex + ' times, giving up.');
                                    } else {
                                        update();
                                    }
                                }
                            }, 5000);
                        });
                    };
                    update();
                };
            }
        };
    })

    .
    controller('RootCtrl', function ($scope, $http, $timeout, PingService) {

        $scope.sonosItems = [
            {ip: "192.168.178.98", label: "Wohnzimmer (L)"},
            {ip: "192.168.178.64", label: "Wohnzimmer (R)"},
            {ip: "192.168.178.22", label: "Büro (L)", switchCode: "11111/2"},
            {ip: "192.168.178.24", label: "Büro (R)", switchCode: "11111/3"}
        ];

        angular.forEach($scope.sonosItems, function (item) {
            var updatePingState = function () {
                PingService.ping(item.ip).then(function (pingOk) {
                    item.pingState = pingOk;
                }, function (error) {
                    item.pingState = false;
                });
                $timeout(updatePingState, 5000);
            };
            updatePingState();

        });

        $scope.wakeOnLan = function (macAddress) {
            $http.put('/wol/' + macAddress).then(function () {
                toastr.success('Wake up request sent.');
            });
        };

        $scope.switch = function (code, state) {
            $http.put('/switch/' + code + "?state=" + state);
        };
    });

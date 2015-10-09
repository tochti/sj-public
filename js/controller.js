'use strict'

var appCtrl = angular.module('AppCtrl', [
    'AppServices',
    'ui.bootstrap',
]);

appCtrl.controller('InitCtrl', [
  '$scope',
  '$rootScope',
  function($scope, $rootScope) {}
]);

appCtrl.controller('OverviewCtrl', [
  function () {}
]);

appCtrl.controller('SeriesCtrl', [
  function () {}
]);

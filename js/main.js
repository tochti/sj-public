'use strict';

var app = angular.module('sj', [
  'ngRoute',
  'AppCtrl',
]);


app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/overview', {
	      templateURL: '/public/angular-tpls/overview.html',
	      controller: 'OverviewCtrl',
      }).when('/series/:id', {
        templateUrl: '/public/angular-tpls/series.html',
        controller: 'SeriesCtrl',
      }).otherwise('/overview');
  }
]);

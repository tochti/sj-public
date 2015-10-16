'use strict';

var app = angular.module('sj', [
  'ngRoute',
  'AppServices',
  'AppCtrl',
]);


app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/signIn', {
        templateUrl: '/public/angular-tpls/signIn.html',
        controller: 'SignInCtrl',
      })
      .when('/overview', {
	      templateUrl: '/public/angular-tpls/overview.html',
	      controller: 'OverviewCtrl',
      })
      .when('/series/:id', {
        templateUrl: '/public/angular-tpls/series.html',
        controller: 'SeriesCtrl',
      })
      .otherwise('/signIn');
  }
]);

'use strict';

var app = angular.module('sj', [
  'ngRoute',
  'AppServices',
  'AppCtrl',
  'AppDirectives',
]);


app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/signIn', {
        templateUrl: '/public/angular-tpls/signIn.html',
        controller: 'SignInCtrl',
      })
      .when('/registrate', {
        templateUrl: '/public/angular-tpls/registrate.html',
        controller: 'RegistrateCtrl',
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

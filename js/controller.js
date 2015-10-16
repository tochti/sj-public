'use strict';

var appCtrl = angular.module('AppCtrl', [
    'ui.bootstrap',
    'SAuth',
]);

appCtrl.controller('SignInCtrl', [
  '$scope',
  '$location',
  'User',
  'Auth',
  'G',
  function($scope, $location, User, Auth, G) {
    $scope.g = G;
    $scope.auth = Auth;
    $scope.auth.setup({
      prefix: '/SignIn',
    });
    $scope.user = User;
    $scope.signIn = function () {
      $scope.user.setup({
        name: $scope.name,
        pass: $scope.pass,
      });

      var success = function (resp) {
        console.log(resp);
        $location.url('/overview')
      }

      var error = function (resp) {
        console.log(resp);
        $scope.g.error(resp.data.Err);
      }

      $scope.auth.signIn($scope.user).then(
          success, error
      );
    }
  }
]);


appCtrl.controller('OverviewCtrl', [
  '$scope',
  'User',
  'Series',
  'Shelf',
  'G',
  function () {
  }
]);

appCtrl.controller('SeriesCtrl', [
  function () {}
]);


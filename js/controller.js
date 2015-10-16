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

appCtrl.controller('RegistrateCtrl', [
  '$scope',
  '$http',
  'G',
  function ($scope, $http, G) {

    $scope.g = G;

    $scope.newUser = function () {
      console.log('test');
      var url = '/User';
      var resp = {
        Data: {
          Name: $scope.name,
          Password: $scope.pass,
        },
      };
      var success = function (resp) {
        console.log(resp);
        if (resp.data.Status !== 'success') {
          $scope.g.error(resp.data.Err);
          return
        }
        
        $scope.g.go2('/signIn');

      }

      var fail = function (resp) {
        console.log(resp);
        $scope.g.error(resp.data.Err);
      }

      $http.post(url, resp).then(success, fail);
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


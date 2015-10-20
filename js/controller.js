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
  '$uibModal',
  'User',
  'Series',
  'Shelf',
  'G',
  function ($scope, $uibModal, User, Series, Shelf, G) {
    $scope.user = User;
    $scope.shelf = Shelf;
    $scope.Series = Series;
    $scope.g = G;

    var init = function () {
      var success = function (sList) {
        if (!$scope.shelf.appendBatch(sList)) {
          $scope.g.error('Cannot add sereis '+ s +' to list');
        }
      }

      var error = function (resp) {
        console.log(resp.data.Err)
      }

      $scope.g.readSeriesOfUser($scope.user)
        .then(success, error);
    }

    $scope.removeSeries = function () {
      var that = this;
      this.series.remove().then(
          function () {
            $scope.shelf.remove(that.series.id());
          },
          function (resp) {
            $scope.g.error(resp.data.Err);
          }
      );
    }

    $scope.newSeries = function () {
      var modal = $uibModal.open({
        templateUrl: '/public/angular-tpls/newSeries.html',
        controller: 'NewSeriesCtrl',
      });

      var newSeries = function (data) {
        console.log(data);
        var s = new $scope.Series(data);

        var success = function (resp) {
          if (!$scope.shelf.append(s)) {
            $scope.g.error('Cannot add series '+ s.Title +' to list');
            s.remove().then(function (){},
              function (resp) {     
                $scope.g.error(resp.data.Err); 
              }
            );
          }
        }

        var error = function (resp) {
          $scope.g.error(resp.data.Err);
        }
        s.save().then(success, error);
      }

      modal.result.then(newSeries);
    }

    init();

  }
]);

appCtrl.controller('NewSeriesCtrl', [
  '$scope',
  '$modalInstance',
  function ($scope, $modalInstance) {
    var readSeriesData = function () {
      var d = {
        Title: $scope.title,
        Image: {
          Name: 'imdb.com',
          URL: $scope.image,
        },
        Portal: {
          Name: 'kinox.to',
          URL: $scope.episodes,
        },
        Episodes: {
          Name: 'kinox.to',
          URL: $scope.episodes,
        },
        Desc: {
          Name: 'imdb.com',
          URL: $scope.image,
        },
      };

      return d;
    }

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    }

    $scope.close = function () {
      var data = readSeriesData();
      $modalInstance.close(data);
    }
  }
]);

appCtrl.controller('SeriesCtrl', [
  function () {}
]);


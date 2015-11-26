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
        $location.url('/overview')
      }

      var error = function (resp) {
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
      var url = '/User';
      var resp = {
        Data: {
          Name: $scope.name,
          Password: $scope.pass,
        },
      };
      var success = function (resp) {
        if (resp.data.Status !== 'success') {
          $scope.g.error(resp.data.Err);
          return
        }
        
        $scope.g.go2('/signIn');

      }

      var fail = function (resp) {
        $scope.g.error(resp.data.Err);
      }

      $http.post(url, resp).then(success, fail);
    }

  }
]);

appCtrl.controller('PageCtrl', [
  '$scope',
  '$uibModal',
  'User',
  'Series',
  'Shelf',
  'G',
  function ($scope, $uibModal, User, Series, Shelf, G) {
    $scope.Series = Series;
    var shelf = Shelf;
    var seriesShelf = shelf.read('series');

    $scope.newSeries = function () {
      var modal = $uibModal.open({
        templateUrl: '/public/angular-tpls/newSeries.html',
        controller: 'NewSeriesCtrl',
      });

      var newSeries = function (data) {
        var s = new $scope.Series(data);

        var success = function (resp) {
          console.log(resp);
          s.data.image = resp.data.Data.Image;
          s.data.id = resp.data.Data.ID;
          if (!seriesShelf.append(s)) {
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

  }
])


appCtrl.controller('OverviewCtrl', [
  '$scope',
  '$uibModal',
  'User',
  'Series',
  'Shelf',
  'G',
  'LastWatched',
  function ($scope, $uibModal, User, Series, Shelf, G, LastWatched) {
    var shelf = Shelf;

    $scope.seriesShelf = shelf.read("series");
    $scope.user = User;
    $scope.Series = Series;
    $scope.g = G;

    var init = function () {
      if (!$scope.user.signedIn()) {
        $scope.g.go2("/signIn");
      }

      var error = function (resp) {
        $scope.g.error(resp.data.Err);
      }

      var success = function (sList) {
        if (!$scope.seriesShelf.appendBatch(sList)) {
          $scope.g.error('Cannot add '+ sList);
        }
      }

      $scope.g.readSeriesOfUser()
        .then(success, error);


      var success = function (wList) {
        angular.forEach(wList, function (val, index) {
          var i = $scope.seriesShelf.indexOfId(val.id());
          if (i !== -1) {
            $scope.seriesShelf.list[i].data.session = val.data.session;
            $scope.seriesShelf.list[i].data.episode = val.data.episode;
          }
        });
      }

      $scope.g.readLastWatchedOfUser()
        .then(success, error);
    }

    $scope.removeSeries = function () {
      var that = this;
      this.series.remove().then(
          function () {
            $scope.seriesShelf.remove(that.series.id());
          },
          function (resp) {
            $scope.g.error(resp.data.Err);
          }
      );
    }

    $scope.updateSeries = function () {
      var that = this;
      var modal = $uibModal.open({
        templateUrl: '/public/angular-tpls/updateSeries.html',
        controller: 'UpdateSeriesCtrl',
        resolve: {
          series: function () {
            return that.series; 
          }
        }
      });

      var updateSeries = function (data) {
        data.seriesId = that.series.id();
        var watched = new LastWatched(data);

        var success = function (resp) {
          var i = $scope.seriesShelf.indexOfId(that.series.id());
          $scope.seriesShelf.list[i].session = resp.data.Session;
          $scope.seriesShelf.list[i].episode = resp.data.Episode;
          that.series.session = resp.data.Session;
          that.series.episode = resp.data.Episode;
        }

        var error = function (resp) {
          $scope.g.error(resp.data.Err);
        }
        watched.save().then(success, error);
      }

      modal.result.then(updateSeries);
    }

    init();


  }
]);

appCtrl.controller('NewSeriesCtrl', [
  '$scope',
  '$modalInstance',
  function ($scope, $modalInstance) {
    $scope.opened = true;

    var readSeriesData = function () {
      var d = {
        Title: $scope.title,
        Image: $scope.image,
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

appCtrl.controller('UpdateSeriesCtrl', [
  '$scope',
  '$modalInstance',
  'series',
  function ($scope, $modalInstance, series) {
    $scope.opened = true;
    $scope.series = series;
    var readUpdateData = function () {
      var d = {
        session: series.data.session,
        episode: series.data.episode,
      };

      return d;
    }

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    }

    $scope.close = function () {
      var data = readUpdateData();
      $modalInstance.close(data);
    }
  }
]);


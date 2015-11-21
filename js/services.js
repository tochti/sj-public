'use strict'

var appServices = angular.module('AppServices', []);

appServices.factory('User', [
  function () {
    var user = {
      _state: false,
      _name: "",
      _pass: "",
      _id: "",

      setup: function (spec) {
        this._name = spec.name;
        this._pass = spec.pass;
      },

      name: function () {
        return this._name;
      },

      pass: function () {
        return this._pass;
      },

      id: function () {
        return this._id;
      },

      signIn: function (id) {
        this._id = id;
        this._state = true;
      },

      signedIn: function () {
        return this._state;
      }

    }

    return user;
  }
]);


appServices.factory('Series', ['$http', '$q',
  function ($http, $q) {
    var isValidData = function (data) {
      if (data === undefined) {
        return false
      }

      if (data.Title === undefined ||
          data.Image === undefined) {
        return false
      }

      return true
    }
    return function (data) {

      if (!isValidData(data)) {
        return {}
      }

      var series = {
        _urlPrefix: '/Series',
        data: {
          id: data.ID || '',
          title: data.Title,
          image: data.Image,
        },

        id: function () {
          return this.data.id;
        },

        save: function () {
          var that = this;
          var d = $q.defer();

          var success = function (resp) {
            if (resp.data.Status === 'success') {
              that._id = resp.data.Data.ID;
              that._image = resp.data.Data.Image;
              d.resolve(resp);
            }

            d.reject(resp);
          }

          var error = function (resp) {
            d.reject(resp);
          }

          var url = this._urlPrefix;
          var req = {
            Data: {
              Title: this.data.title,
              Image: this.data.image,
            },
          }
          $http.post(url, req).then(success, error);

          return d.promise;
        },

        remove: function () {
          var d = $q.defer();

          var success = function (resp) {
            if (resp.data.Status === 'success') {
              d.resolve(resp);
            }

            d.reject(resp);
          }

          var error = function (resp) {
            d.reject(resp);
          }

          var url = this._urlPrefix +'/'+ this.id();
          $http.delete(url).then(success, error);

          return d.promise;

        },

      };

      return series;

    }
  }
]);

// Verwaltet eine Liste von Objekten
appServices.factory('Shelf', [
  function () {
    var Shelf = function () {
      return {
        list: [],
        // Fügt ein Objekt der Liste hinzu
        // Das Objekt welches hinzugefügt wird muss folgende Funktionen besitzen
        // id() string
        //
        // append(obj {}) bool
        append: function (obj) {
          if (obj.constructor === Array) {
            return this.appendBatch(obj);
          }

          return this.appendOne(obj);

        },
        appendBatch: function (objs) {
          var that = this;
          var ok = true;

          angular.forEach(objs, function (val, i) {
            var r = that.appendOne(val);
            if (!r) {
              ok = false;
              return;
            }
          });

          return ok;
        },
        appendOne: function (obj) {
          if (typeof obj.id !== 'function' || typeof obj.data !== 'object') {
            return false
          }

          this.list.push(obj);
          return true
        },
        // Entfernt ein Objekt mit der id X aus der Liste
        // 
        // remove(id string) {...}
        remove: function (id) {
          var found = [];
          var index = this.indexOfId(id);
          if (index === -1) {
            return {}
          }

          return this.list.splice(index, 1)[0];
        },
        // Ersetzte ein Objekt durch ein geupdateds Objekt 
        update: function (id, updatedObj) {
          var i = this.indexOfId(id);
          this.list[i] = updatedObj;
        },
        // Findet die Position eines Objekts mit der id X
        indexOfId: function (id) {
          var found = -1;
          angular.forEach(this.list, function (val, index) {
            if (id === val.id()) {
              found = index;
              return;
            }
          });

          return found;
        },
        // Gibt das Objekt mit der id X zurück
        read: function (id) {
          var i = this.indexOfId(id);
          if (i === -1) {
            return {}
          }

          return this.list[i];
        },
        // Findet ein Liste mit Objekten zurück im Feld X das Pattern Y haben.
        find: function(field, pattern) {
          var regx = new RegExp(pattern, 'i');
          var found = [];

          angular.forEach(this.list, function (val, i) {
            if (val.data[field].match(regx)) {
              found.push(val);
            }
          });

          return found;
        },
      }
    };

    return {
      _shelfs: {},
      read: function (name) {
        if (this._shelfs[name] === undefined) {
          this._shelfs[name] = new Shelf();
        }

        return this._shelfs[name];
      }
    }

  }
]);

appServices.factory('LastWatched', [
  '$http',
  '$q',
  function ($http, $q) {
     return function (data) {
      return {
        data: {
          seriesId: data.seriesId,
          session: data.session,
          episode: data.episode,
        },

        id: function () {
          return this.data.seriesId;
        },

        save: function () {
          var that = this;
          var d = $q.defer();

          var success = function (resp) {
            if (resp.data.Status === 'success') {
              that._id = resp.data.Data.ID;
              d.resolve(resp);
            }

            d.reject(resp);
          }

          var error = function (resp) {
            d.reject(resp);
          }

          var url = '/LastWatched';
          var req = {
            Data: {
              SeriesID: parseInt(this.data.seriesId),
              Session: parseInt(this.data.session),
              Episode: parseInt(this.data.episode),
            }
          };
          $http.post(url, req).then(success, error);

          return d.promise;
        },

      }
    }
  }
]);

appServices.factory('G', [
  '$rootScope',
  '$http',
  '$q',
  '$location',
  'Series',
  'LastWatched',
  function ($rootScope, $http, $q, $location, Series, LastWatched) {
    return {
      readLastWatchedOfUser: function () {
        var wList = [];
        var d = $q.defer();

        var url = '/LastWatchedList'
        var success = function (resp) {
          if (resp.data.Status !== 'success') {
            d.reject(resp);
            return
          }

          angular.forEach(resp.data.Data, function (val, index) {
            wList.push(new LastWatched({
              seriesId: val.SeriesID,
              session: val.Session,
              episode: val.Episode,
            }));
          });


          d.resolve(wList);
          return
        };

        var error = function (resp) {
          d.reject(resp);
        }

        $http.get(url).then(success, error);

        return d.promise;
      },

      readSeriesOfUser: function () {
        var series = Series;
        var sList = [];
        var d = $q.defer();

        var url = '/ReadSeriesList';
        var success = function (resp) {
          if (resp.data.Status !== 'success') {
            d.reject(resp);
            return
          }

          angular.forEach(resp.data.Data, function (val, index) {
            sList.push(new series(val));
          });


          d.resolve(sList);
          return

        }
        
        var error = function (resp) {
          d.reject(resp);
        }

        $http.get(url).then(success, error);

        return d.promise;
      },
      
      error: function (msgs) {
        if (msgs.constructor !== Array) {
          msgs = [msgs];
        }

        $rootScope.globalError = {
          show: true,
          msg: msgs,
          close: function () {
            this.show = false;
          }
        }

        setTimeout(function () {
          $rootScope.globalError.close();
          $rootScope.$apply();
        }, 15 * 1000);
      },

      go2: function (url) {
        $location.url(url);
      }
    }
  }
]);

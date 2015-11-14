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
        _id: data.ID || '',
        _title: data.Title,
        _image: data.Image,

        id: function () {
          return this._id;
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

          var url = this._urlPrefix;
          var req = {
            Data: {
              Title: this._title,
              Image: this._image,
            },
          }
          $http.post(url, req).then(success, error);

          return d.promise;
        },

        data: function () {
          return {
            ID: this._id,
            Title: this._title,
            Image: this._image,
          }
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
        _objs: [],
        // Fügt ein Objekt der Liste hinzu
        // Das Objekt welches hinzugefügt wird muss folgende Funktionen besitzen
        // id() string
        // data() {}
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
          if (typeof obj.id !== 'function' || typeof obj.data !== 'function') {
            return false
          }

          this._objs.push(obj);
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

          return this._objs.splice(index, 1)[0];
        },
        // Ersetzte ein Objekt durch ein geupdateds Objekt 
        update: function (id, updatedObj) {
          var i = this.indexOfId(id);
          this._objs[i] = updatedObj;
        },
        // Findet die Position eines Objekts mit der id X
        indexOfId: function (id) {
          var found = -1;
          angular.forEach(this._objs, function (val, index) {
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

          return this._objs[i];
        },
        // Gibt ein Array mit allen Objekten zurück
        list: function () {
          return this._objs;
        },
        // Findet ein Liste mit Objekten zurück im Feld X das Pattern Y haben.
        find: function(field, pattern) {
          var regx = new RegExp(pattern, 'i');
          var found = [];

          angular.forEach(this._objs, function (val, i) {
            if (val.data()[field].match(regx)) {
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
        _id: data.SeriesID,
        _session: data.Session,
        _episode: data.Episode,
        id: function () {
          return this._id;
        },
        data: function () {
          return {
            SeriesID: this._id,
            Session: parseInt(this._session),
            Episode: parseInt(this._episode),
          }
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
            Data: this.data(),
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
            wList.push(new LastWatched(val));
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

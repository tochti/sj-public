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

      login: function (id) {
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
          data.Image === undefined || 
          data.Desc === undefined || 
          data.Episodes === undefined ||
          data.Portal === undefined) {
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
        _id: '',
        _title: data.Title,
        _image: data.Image,
        _desc: data.Desc,
        _episodes: data.Episodes,
        _portal: data.Portal,

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
              Desc: this._desc,
              Episodes: this._episodes,
              Portal: this._portal,
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
  }
]);

appServices.factory('G', ['$http', '$q',
  function ($http, $q) {
    return {
      // Expect user to have a id() string function
      readSeriesOfUser: function (user) {
        var d = $q.defer();

        var url = '/SeriesOfUser/'+ user.id();
        var success = function (resp) {
          if (resp.data.Status !== 'success') {
            d.reject(resp);
            return
          }

          d.resolve(resp);

        }
        
        var error = function (resp) {
          d.reject(resp);
        }

        $http.get(url).then(success, error);

        return d.promise;
      },
    }
  }
]);

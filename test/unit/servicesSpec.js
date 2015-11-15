'use strict';

describe('Services', function() {

  beforeEach(module('sj'));

  describe('User', function () {

    var $s,
      $rootScope,
      userName,
      userPass;

    beforeEach(inject(function ($injector) {
      $rootScope = $injector.get('$rootScope')
      $s = $rootScope.$new(); 
      $s.user = $injector.get('User');

      userName = "LoverXX";
      userPass = "1234";

      $s.user.setup({
        name: userName,
        pass: userPass,
      })


    }));

    it('should have user method', function () {
      expect($s.user.name()).toBe(userName)
    });

    it('should have pass method', function () {
      expect($s.user.pass()).toBe(userPass)
    });

    it('should have id method', function () {
      $s.user.signIn('123');
      expect($s.user.id()).toBe('123');
    });

    it('signIn user', function () {
      expect($s.user.signedIn()).toBe(false);
      $s.user.signIn('123');
      expect($s.user.signedIn()).toBe(true);
    });

  });

  describe('Series', function () {

    var $rootScope,
        $s,
        $httpBackend,
        seriesTitle,
        seriesID,
        seriesImage,
        seriesData;

    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
      $s = $rootScope.$new();
      $s.Series = $injector.get('Series');
      seriesID = '123';
      seriesTitle = 'Mr. Robot';
      seriesImage = 'robot.png'
      seriesData = {
        ID: seriesID,
        Title: seriesTitle,
        Image: seriesImage,
      };

    }));

    it('crud series', function (done) {
      $httpBackend
        .expectPOST('/Series')
        .respond({
          'Status': 'success', 
          'Data': {
            'ID': seriesID,
            'Image': seriesImage,
            'Title': seriesTitle
          }
        });

      var series = new $s.Series(seriesData);
      series.save().then(
        function (resp) {
          expect(series.id()).toBe(seriesID)
        }
      );

      $httpBackend.flush();
      $s.$apply();

      var d = series.data();
      console.log(d);
      expect(d['Title']).toBeDefined();
      expect(d['Image']).toBeDefined();

      $httpBackend
        .expectDELETE('/Series/'+ seriesID)
        .respond({'Status': 'success', 'Data': {'ID': seriesID}});

      series.remove().then(
        function (resp) {
          done();
        }
      );

      $httpBackend.flush();
      $s.$apply();

    });

  });

  describe('Shelf', function () {

    var $rootScope,
      $s;

    var O = function (d) {
      var o = {
        data: function () {
          return d.data
        },
        id: function () {
          return d.id
        },
      }

      return o;
    }
      

    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $s = $rootScope.$new();
      $s.shelf = $injector.get('Shelf');
    }));

    it('crud objects', function() {
      var obj1 = new O({
        id: "1",
        data: {
          Name: "one",
        },
      });

      var obj2 = new O({
        id: "2",
        data: {
          Name: "two",
        },
      });
      var objs = [obj1, obj2]

      var shelf = $s.shelf.read('test');

      expect(shelf.append(objs)).toBe(true);
      expect(shelf.list()).toEqual(objs);

      var o = shelf.remove(obj1.id());
      expect(o).toEqual(obj1);
      expect(shelf.list()).toEqual([obj2]);

      o = shelf.read(obj2.id());
      expect(o).toEqual(obj2);

      var updated = new O({
        id: "2",
        data: {
          Name: "TWO",
        },
      });
      shelf.update(obj2.id(), updated);
      o = shelf.read(obj2.id());
      expect(o.data()).toEqual(updated.data());

      var r = shelf.find('Name', 'T');
      expect(r).toEqual([updated]);

    });

  });

  describe('G', function () {

    describe('readSeriesOfUser', function () {
      var $httpBackend,
        $s,
        $rootScope;

      beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');
        $s = $rootScope.$new();
        $s.g = $injector.get('G');
        $s.Series = $injector.get('Series');
      }));

      it('should return all series of a user', function (done) {
        var expectResp = {'Status': 'success', 'Data': [{'Title': 'Mr. Robot'}]};
        $httpBackend
          .expectGET('/ReadSeriesList')
          .respond(expectResp);

        $s.g.readSeriesOfUser().then(function (sList) {
          var result = [
            new $s.Series({
              Title: 'Mr. Robot',
            })
          ];
          expect(sList).toEqual(result);
          done();
        });

        $httpBackend.flush();
        $s.$apply();

      });

    });

    describe('lastWatchedOfUser', function () {

      var $httpBackend, 
        $scope,
        g,
        LastWatched;

      beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $scope = $injector.get('$rootScope').$new();
        g = $injector.get('G');
        LastWatched = $injector.get('LastWatched');
      }));

      it('should return all last watched data of a user', function (done) {
        var expectResp = {'Status': 'success', 'Data': [{'SeriesID': 1}]};
        $httpBackend
          .expectGET('/LastWatchedList')
          .respond(expectResp);

        g.readLastWatchedOfUser().then(function (wList) {
          expect(wList[0].data().SeriesID).toEqual(1);
          done();
        });

        $httpBackend.flush();
        $s.$apply();

      });

    });

  });

});

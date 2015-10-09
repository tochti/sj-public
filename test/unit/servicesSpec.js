'use strict';

describe('Services', function() {

  beforeEach(module('sj'));

  describe('User', function () {

    var $scope,
      $rootScope,
      userName,
      userPass,
      user;

    beforeEach(inject(function ($injector) {
      $rootScope = $injector.get('$rootScope')
      $scope = $rootScope.$new(); 
      user = $injector.get('User');

      userName = "LoverXX";
      userPass = "1234";

      user.setup({
        name: userName,
        pass: userPass,
      })


    }));

    describe('should have user method', function () {
      expect(user.name()).toBe(userName)
    });

    describe('should have pass method', function () {
      expect(user.pass()).toBe(userPass)
    });

    describe('loggin user', function () {
      expect(user.singedIn()).toBe(false);
      user.login(true)
      expect(user.singedIn()).toBe(true);
    });

  });
});

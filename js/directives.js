'use strict'

var appDirectives = angular.module('AppDirectives', []);

appDirectives.directive('dateProxy', ['Globals',
  function (Globals) {

    return {
      require: ['ngModel'],
      link: function (scope, element, attr, ctrl) {
        scope.globals = Globals;

        ctrl[0].$parsers.push(function (val) {
          return scope.globals.makeMongoDBDate(val);
        });

        ctrl[0].$formatters.push(function (val) {
          return scope.globals.makeEuroDateFormat(val);
        });

      },
    };

  }
]);

appDirectives.directive('focusMe', ['$parse', '$timeout',
  function ($parse, $timeout) {
    return {
      scope: {trigger: '@focusMe'},
      link: function (scope, element, attr, ctrl) {
        scope.$watch('trigger', function(value) {
          if(value === 'true') { 
            $timeout(function() {
              element[0].focus(); 
            });
          }
        })
      },
    }
  }
]);

'use strict';

describe('Directive: scoreboard', function () {

  // load the directive's module
  beforeEach(module('oscarsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<scoreboard></scoreboard>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the scoreboard directive');
  }));
});

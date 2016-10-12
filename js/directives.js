angular.module("app")
.directive('appNavbar', [function () {
    return {
        restrict: 'A',
        templateUrl : 'html/navbar.html',
        replace : true,
        link: function (scope, iElement, iAttrs) {
            
        }
    };
}])

.directive('appFooter', [function () {
    return {
        restrict: 'A',
        templateUrl : 'html/footer.html',
        replace : true,
        link: function (scope, iElement, iAttrs) {
            
        }
    };
}])

.directive('scrollPosition', function($window) {
  return {
    scope: {
      pos: '=scrollPosition'
    },
    link: function(scope, element, attrs) {
      var windowEl = angular.element($window);
      var handler = function() {
        scope.pos = windowEl.scrollTop();
      }
      windowEl.on('scroll', scope.$apply.bind(scope, handler));
      handler();
    }
  };
})

.directive('embedVimeo', function() {
  return {
      scope: {
        it: '='
      },
    //template: '<div class="center-block col-lg-12"  ng-repeat="v in rilievo.video">{{v.link}}<iframe src="v.link" width="320" height="214" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>',
      templateUrl: 'html/vimeodirective.html',
      replace: true

  };
})

;





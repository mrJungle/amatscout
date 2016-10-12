
angular.module("app", [ 'ui.router','ui.bootstrap.tabs','angularSpinner', 'firebase', 'ui.bootstrap', 'ui.bootstrap.collapse', 'ui.bootstrap.rating', 'ui.bootstrap.tabs', 'ui.bootstrap.modal','ui.bootstrap.datepicker','ui.bootstrap.datepickerPopup', 'nvd3', 'leaflet-directive','ngOrderObjectBy'])
//'ngAnimate', <-- da alcuni problemi

.run(['$anchorScroll', function($anchorScroll) {
  $anchorScroll.yOffset = 500;   // always scroll by 50 extra pixels
}])

.config(function($stateProvider, $urlRouterProvider,  $logProvider) {



  $logProvider.debugEnabled(false);


 
  $urlRouterProvider.otherwise("/home");
  // Now set up the states
  $stateProvider
  .state('app', {
      abstract : true,
      sticky : true,
      cache: false,
      controller: 'AppCtrl',
      views : {
        'app' : {
          template : '<div ui-view></div>'
        }
      }
    })
  .state('app.home', {
    url: "/home",
    cache: false,
    templateUrl: "html/home.html",
    controller: 'HomeCtrl'
  })
  .state('app.settings', {
      url: "/settings",
      cache: true,
      templateUrl: "html/settings.html",
      controller: 'SettingsCtrl'
    })
  .state('app.login', {
      url: "/login",
      cache: true,
      templateUrl: "html/login.html",
      controller: 'LoginCtrl'
    })
  .state('app.rilievo', {
    url: "/campagna/:campagnaId/rilievo/:rilievoId",
    cache : false,
    templateUrl: "html/rilievo.html",
    controller : "RilievoCtrl"
  })


  })
    
.run(function(){
    console.log("Avvio")
})


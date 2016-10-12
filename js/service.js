angular.module("app")

    // esempio di factory
    .factory("appService", function($http, $q) {
        var ex = function(){
            return 'ciao'
        }
           
        return {
            ex : ex, 
        };
    })
    // factory per la gestione utente in app 
    .factory('LocalUser', function ($http, $q, $rootScope, $window) {

        var svc = {};

        svc.user = {'name':null, 
                    'psw':null };

        svc.addUser = function(user){
            console.log(user)
            $window.localStorage.username = user.name;
            $window.localStorage.userpsw = user.psw;
            svc.user = user;
        };

        svc.removeUser = function(){
            $window.localStorage.removeItem("username");
            $window.localStorage.removeItem("userpsw");
            svc.user = {'name':null, 
                        'psw':null };
        };

        var tk = {'name':$window.localStorage.username, 
                  'psw':$window.localStorage.userpsw 
                };

        
        if(tk.name){
            svc.addUser(tk)
        };
        
        return svc;

    })

    // factory per la gestione del db su firebase
    .factory("localitaServiceArr", function($firebaseArray) {
      var sRef = new firebase.database().ref("localita");
      return $firebaseArray(sRef);
    })
    // factory per la gestione del db su firebase
    .factory("localitaServiceObj", function($firebaseObject) {
      var sRef = new firebase.database().ref("localita");
      return $firebaseObject(sRef);
    })
    // factory per la gestione del db su firebase
    .factory("utilsServiceArr", function($firebaseArray) {
      var utilsRef = new firebase.database().ref("utils");
      return $firebaseArray(utilsRef);
    })
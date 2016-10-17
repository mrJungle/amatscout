angular.module('app')

.controller('AppCtrl', function ($scope, $firebaseAuth, LocalUser, $state, $document,  $rootScope) {

    var auth = $firebaseAuth();

    $rootScope.autenticato = false;

    $rootScope.followMouse = false;

    $rootScope.cambia = function(a){
        $rootScope.followMouse = !a;
    }

    $rootScope.focusCampagna = function(id){
        $rootScope.focus = id
    }

    //$rootScope.convertiData

    $rootScope.convertiDataInt = function(d){
        var newDate = new Date(d);
        return newDate.getTime()
    }

    $rootScope.autentica = function(){$rootScope.autenticato = true;}
    $rootScope.disautentica = function(){$rootScope.autenticato = false;}

    if(LocalUser.user.name != null){
        var name = LocalUser.user.name
        var psw = LocalUser.user.psw
        auth
            .$signInWithEmailAndPassword(name, psw)
                .then(function(firebaseUser) {
                    //console.log("Signed in as:", firebaseUser.uid);
                    $rootScope.autenticato = true;
                }).catch(function(error) {
                    console.log("Errore di Autenticazione");
                    //console.log("Authentication failed:", error);
                }); 
        }

    $rootScope.bottoneToTop = false;

    $document.on('scroll', function() {
          if ($document.scrollTop() >= 50 && ($rootScope.bottoneToTop==false)) {
            $rootScope.bottoneToTop = !$rootScope.bottoneToTop
           $('.scrollToTop_d').fadeIn();
            }
          if ($document.scrollTop() < 50 && ($rootScope.bottoneToTop==true)) {
              $('.scrollToTop_d').fadeOut();
              $rootScope.bottoneToTop = !$rootScope.bottoneToTop
              }
        
      });
})


.controller('SettingsCtrl', function ($scope, $http, $firebaseAuth, LocalUser, $rootScope, $firebase, $state, localitaServiceArr,  utilsServiceArr) {

    $('html, body').animate({scrollTop : 0},800);

    // inizializzo variabili locali
    $scope.showSpinner = true;
    $scope.caricamentoDati = true

    //avvio i service
    $scope.localitaServiceArr = localitaServiceArr
    $scope.utilsServiceArr = utilsServiceArr
    $scope.utente = LocalUser.user
    
    //funzioni utili 
    $scope.convertiData = function(d){
        var newDate = new Date(d);
        return newDate
    }

    $scope.doLogOut = function(){
        $firebaseAuth()
            .$signOut()
            LocalUser.removeUser();
            $rootScope.disautentica();
            $state.go('app.home');
    }

    $scope.localitaServiceArr.$loaded().then(function() {
        $scope.caricamentoDati = false
        $scope.numLastModifica = $scope.localitaServiceArr.length-1
        $scope.idLastModifica = $scope.localitaServiceArr[$scope.numLastModifica].$id
        $scope.totLocLastModifica = $scope.localitaServiceArr[$scope.numLastModifica].listaLocalita.length
        $scope.utilsServiceArr.$loaded()
            .then(function() {
                $scope.showSpinner =false;
                //console.log($scope.utilsServiceArr.length)
                _.each($scope.utilsServiceArr, function(num){ num.last = 0;});
                $scope.utilsServiceArr[($scope.utilsServiceArr.length-1)].last = 1
            });            
    });

    $scope.controllaDimensioniBkUp = function(){
        if ($scope.utilsServiceArr.length >= 4){
            //console.log($scope.utilsServiceArr.length)
            $scope.utilsServiceArr
                .$remove($scope.utilsServiceArr[0])
                    .then(function(ref) {
                        // il secondo if potrebbe essere ridondante
                        if ($scope.utilsServiceArr.length >= 4){
                            $scope.controllaDimensioniBkUp()
                        }
                        // data has been deleted locally and in the database
                    }, function(error) {
                        console.log('Errore')
                        //console.log("Error:", error);
                        });

        }
    }

    $scope.ripristina = function(id){
        $scope.showSpinner = true;
        var datiDaRipristinare = _.find($scope.utilsServiceArr, function(num){ return num.$id == id; })
        //datiDaRipristinare
        $scope.localitaServiceArr[0].listaLocalita = datiDaRipristinare.listaLocalita
        $scope.localitaServiceArr[0].ulog = 'Ripristino -> ' + datiDaRipristinare.ulog + 'del '+datiDaRipristinare.udateDate
        $scope.localitaServiceArr[0].udateDate = (new Date()).toString();
        //modificare  il salva per creare gli stack di db da percorrere temporalmente
        $scope
            .localitaServiceArr
                .$save($scope.localitaServiceArr[0])
                    .then(function(ref) {
                        //console.log('salvato1')
                        ref.key === $scope.localitaServiceArr[0].$id; // true
                    });
        $scope.
            utilsServiceArr
                .$add($scope.localitaServiceArr[0])
                    .then(function(n){
                        //console.log('salvatoBkUp')
                        _.each($scope.utilsServiceArr, function(num){ num.last = 0;});
                        $scope.utilsServiceArr[($scope.utilsServiceArr.length-1)].last = 1
                        $scope.
                            utilsServiceArr
                                .$save()
                                    .then(function(n){
                                        console.log('salvatoBkUp tot')
                                        $scope.showSpinner = false;
                                    });
                    });
        $scope.controllaDimensioniBkUp()
    }
})


.controller('LoginCtrl', function ($scope,$stateParams, $firebaseAuth, LocalUser, $rootScope,  usSpinnerService, $state) {

    $('html, body').animate({scrollTop : 0},800);

//aggiungere il bottone non cliccabile se i due campi non sono compilati entrambi

    $scope.buttonCheck = false;
    $scope.showSpinner = false;

    $scope.loginData = { username : '',  
                         password : ''}

    $scope.$watch("loginData.password", function() {
        //console.log('ciao',  $scope.buttonCheck);
 
    if ( ($scope.loginData.username != '') 
        &&  
       (  ($scope.loginData.password != '') 
        )
       )
        $scope.buttonCheck = true;
    else {$scope.buttonCheck = false;}
    });

    $scope.$watch("loginData.username", function() {
        //console.log('ciao',  $scope.buttonCheck);
 
    if ( ($scope.loginData.username != '') 
        &&  
       (  ($scope.loginData.password != '') 
        )
       )
        {$scope.buttonCheck = true;}
    else {$scope.buttonCheck = false;}
    });

    var auth = $firebaseAuth();

  // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        $scope.showSpinner = true;
    //console.log('Doing login', $scope.loginData);
    if ( ($scope.loginData.username != '') 
        &&  
       (  ($scope.loginData.password != '') 
        )
       )
    {
  // login with Facebook
    auth.$signInWithEmailAndPassword($scope.loginData.username, $scope.loginData.password).then(function(firebaseUser) {
        //console.log("Signed in as:", firebaseUser.uid);
        //$scope.user = firebase.auth().currentUser;
        var user = {'name':$scope.loginData.username, 
                    'psw':$scope.loginData.password}
        LocalUser.addUser(user)
        $rootScope.autentica();
        $scope.showSpinner = false;
        $state.go('app.home');
    //    console.log($scope.user);
    }).catch(function(error) {
        $scope.showSpinner = false;
        console.log("Authentication failed:", error);
        });
    }
    else {
        console.log('error')
    }
    };



})





.controller('HomeCtrl', function ($scope, $http, $location, $anchorScroll,appService, $q, $uibModal, $log, $rootScope, localitaServiceObj, localitaServiceArr,  $firebaseArray, utilsServiceArr,  $rootScope) {




    $('html, body').animate({scrollTop : 0},800);

    $scope.showSpinner = true;

    $scope.contaVideo = function(array){ 
        if (array.video) {return array.video.length}
        return 0
    }

    $scope.goto = function(x) {
        $location.hash(x);
        $anchorScroll();
    };

    if ($rootScope.focus){
        $scope.goto($rootScope.focus)
    }

    $scope.boxClass = true;
    $scope.toolsClass = true;

    $scope.item2Add = {}

    $scope.item2Add.lat = undefined
    $scope.item2Add.lng = undefined

    $scope.IndiceOpen = function(){ $scope.toolsClass = !$scope.toolsClass;}

    $scope.pos = 0;

    $scope.caricamentoDati = true

    $scope.dati = {}

    $scope.dati.rilievi = []

    $scope.localitaServiceArr = localitaServiceArr

    $scope.localitaServiceObj = localitaServiceObj

    $scope.utilsServiceArr = utilsServiceArr

    $scope.itemTemp = {}

    Date.prototype.ddmmyyyy = function() {
      var mm = this.getMonth() + 1;
      var dd = this.getDate();
      var check = function(i){if (i< 10) { return '0'+i } return i }
      return [check(dd), check(mm), this.getFullYear()].join('-'); // padding
    };

    String.prototype.hashCode = function() {
      var hash = 0, i, chr, len;
      if (this.length === 0) return hash;
      for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      if (hash<0){return hash*(-1);}
      return hash;
    };


    $scope.localitaServiceArr.$loaded().then(function() {
        $scope.caricamentoDati = false
        $scope.numLastModifica = $scope.localitaServiceArr.length-1
        //console.log($scope.numLastModifica)
        $scope.idLastModifica = $scope.localitaServiceArr[$scope.numLastModifica].$id
        //console.log($scope.idLastModifica)
        $scope.totLocLastModifica = $scope.localitaServiceArr[$scope.numLastModifica].listaLocalita.length
        $scope.utilsServiceArr.$loaded()
            .then(function() {
                // ricontrollo che i colori siano giusti 
                _.each($scope.localitaServiceArr[0].listaLocalita, function(num){num.icon.markerColor = $scope.checkColor(num)})
                $scope.showSpinner =false;
            });            

//        _.each($scope.localitaServiceArr[0].listaLocalita, function(num){
//            console.log(num.icon)
//            num.icon.icon = 'car'
//            num.icon.prefix = 'fa'
//            _.each(num.rilievi, function(r){
//                if (r.icon)(console.log(r.icon))
//                else {r.icon = 'car'}              
//            })
//        })


    });



    $scope.centraCampagna = function(item){
        //console.log('test', item)
        $scope.london = {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
            zoom: 18}
        //$scope.checkColor(item);
    };

 $scope.$on('leafletDirectiveMap.contextmenu', function(e, args) {
            if (!$scope.toolsClass){
                var coordinate = args.leafletEvent.latlng
                $scope.item2Add.lat = coordinate.lat
                $scope.item2Add.lng = coordinate.lng
                $scope
                    .localitaServiceArr[$scope.numLastModifica]
                        .listaLocalita['tempMark'] = {
                lat: $scope.item2Add.lat,
                lng: $scope.item2Add.lng,
                message: '<strong> Nuova Località </strong>',
                focus: false,
                draggable: false,
                icon: { type: 'awesomeMarker',
                        icon: 'star',
                        prefix:'fa',
                        markerColor: 'purple'
                    }
                }
            }
        }); 


 $scope.$on('leafletDirectiveMarker.click', function(e, args) {
            $scope.goto(args.model.id)
        }); 

 $scope.$on('leafletDirectiveMarker.dragend', function(e, args) {
            $scope
            .localitaServiceArr[$scope.numLastModifica]
                .listaLocalita[args.modelName].lat = args.model.lat
                        $scope
            .localitaServiceArr[$scope.numLastModifica]
                .listaLocalita[args.modelName].lng = args.model.lng
        });





//////// cambiare
    $scope.addItemCampagna = function(item){
        if (!$scope.checkLocalita()){
            if (item.nome){
                //console.log($scope.numLastModifica);
                $scope.localitaServiceArr[$scope.numLastModifica].listaLocalita[item.nome.hashCode()]={
                            lat: parseFloat(item.lat),
                            lng: parseFloat(item.lng),
                            message: '<strong>'+item.nome.toLowerCase()+item.nome.hashCode()+'</strong>',
                            focus: false,
                            draggable: false,
                            icon: { type: 'awesomeMarker',
                                    icon: 'indefinito',
                                    prefix:'fa',
                                    markerColor: 'purple'
                            },
                            'rilievi':[],
                            'name':item.nome.toLowerCase(),
                            'id': item.nome.hashCode(),
                            'active':false,
                            'lastUpdate':'none'
                        }
            delete $scope.localitaServiceArr[$scope.numLastModifica].listaLocalita['tempMark']
            $scope.goto(item.nome.hashCode())
            // aggiorno la data per rolback
            $scope.localitaServiceArr[$scope.numLastModifica].udateDate = (new Date()).toString();
            $scope.localitaServiceArr[$scope.numLastModifica].ulog = 'Aggiunta nuova località ('+item.nome.toLowerCase()+')';            
            // rimuovere il salva e aprire il modal con i dati
            //usando la funzione salva la dentro
            $scope.localitaServiceArr.$save($scope.localitaServiceArr[$scope.numLastModifica]).then(function(ref) {
              ref.key === $scope.localitaServiceArr[$scope.numLastModifica].$id; // true
            });
            $scope.
                utilsServiceArr
                    .$add($scope.localitaServiceArr[$scope.numLastModifica])
                        .then(function(n){
                            console.log('salvatoBkUp')
                        });
            $scope.controllaDimensioniBkUp()
            $scope.item2Add = {}
            $scope.IndiceOpen()
            }
            else {console.log('vuoto')}
        }
    }

    $scope.convertiData = function(d){
        var newDate = new Date(d);
        return newDate
    }


    $scope.checkIcon = function(item){
        var a = _.uniq(_.pluck(item.rilievi,  'icon'))
        //console.log(item)
        //console.log(a)
        if (a.length>1 ){return 'road'}
        if (a.length==0 ){return 'indefinito'}
        return a[0]
    }


    $scope.activeEditCampagna = function(item){
        item.active = !item.active;
        if (!item.active){
            item.draggable = false;            
            item.icon.markerColor =  $scope.checkColor(item);
            item.icon.icon = $scope.checkIcon(item);
            item.icon.type = 'awesomeMarker';
            item.icon.prefix = 'fa';
        }
        else{
            item.draggable = true;
            item.icon.markerColor = 'orange';
            item.icon.icon = 'pencil';        
        }
    };


    $scope.addItemRilievo = function(item){
        if (item.rilievi == undefined) {item.rilievi = []}
        item.rilievi.push({'giorno':'aaaa-mm-gg', 'link':'http://linkesempio.com', 'tipologia':'car'})            
    }

    $scope.resetEditCampagna = function(item){
//        console.log(item)
        $scope.activeEditCampagna(item)
    }



    $scope.checkColor = function(item){
        var assegnaColore = function(lu){
            var l = new Date(lu)
            var o = new Date()
            if (o-l < (1000*60*60*24*365)){return 'green'}
            if (o-l < (1000*60*60*24*365*2)){return 'blue'}
            else {return 'red'}
        }
        if (item.lastUpdate){
//            var last = new Date(item.lastUpdate)
//            var oggi = new Date()
//            if (oggi-last < (1000*60*60*24*365)){return 'green'}
//            if (oggi - last < (1000*60*60*24*365*5)){return 'blue'}
//            else {return 'red'}
            return assegnaColore(item.lastUpdate)
        }
        else {item.lastUpdate = (_.max(item.rilievi, function(n){
                                                        var d = new Date(n.giorno)
                                                        return d.getTime()})).giorno
            }
        return assegnaColore(item.lastUpdate)
    }

    $scope.saveCampagna = function(item){
        $scope.showSpinner = true;
        //console.log($scope.localitaServiceArr[$scope.numLastModifica])
        item.message = '<strong>'+item.name.toLowerCase()+'</strong>';
        item.name = item.name.toLowerCase()
        if($scope.localitaServiceArr[$scope.numLastModifica].listaLocalita[item.id].rilievi != undefined){
            var max = (_.max($scope.localitaServiceArr[$scope.numLastModifica].listaLocalita[item.id].rilievi, function(num){var d = new Date(num.giorno); return d;})).giorno            
            item['lastUpdate'] = max;
            item.icon.markerColor =  $scope.checkColor(item)
            item.icon.icon = $scope.checkIcon(item);
        }
//
// aggiungere controllo dellultimo aggiornmento per colore e tipologia rilievo
//
//
        // aggiornamento stato db
        $scope.localitaServiceArr[$scope.numLastModifica].udateDate = (new Date()).toString();
        $scope.localitaServiceArr[$scope.numLastModifica].ulog = 'Modifica nella località: '+item.name+' ';            
        //modificare  il salva per creare gli stack di db da percorrere temporalmente
        //console.log($scope.localitaServiceArr[$scope.numLastModifica])
        $scope
            .localitaServiceArr
                .$save($scope.localitaServiceArr[$scope.numLastModifica])
                    .then(function(ref) {
                        ref.key === $scope.localitaServiceArr[$scope.numLastModifica].$id; // true
                    });
        $scope.
            utilsServiceArr
                .$add($scope.localitaServiceArr[$scope.numLastModifica])
                    .then(function(n){
                        console.log('salvatoBkUp')
                        $scope.showSpinner = false;
                    });
        $scope.controllaDimensioniBkUp()
    }


    $scope.delItemCampagna = function(item){
        if(item){
            //aggiornamento per rollback
            $scope.localitaServiceArr[$scope.numLastModifica].udateDate = (new Date()).toString();
            $scope.localitaServiceArr[$scope.numLastModifica].ulog = 'Eliminata campagna in località '+item.name+')';            
//
// aggiungere controllo dellultimo aggiornmento per colore e tipologia rilievo
//
//
            delete $scope.localitaServiceArr[$scope.numLastModifica].listaLocalita[item.id]
            $scope
                .localitaServiceArr
                    .$save($scope.localitaServiceArr[$scope.numLastModifica])
                        .then(function(ref) {
                            ref.key === $scope.localitaServiceArr[$scope.numLastModifica].$id; // true
                        });
            $scope.
                utilsServiceArr
                    .$add($scope.localitaServiceArr[$scope.numLastModifica])
                        .then(function(n){
                            console.log('salvatoBkUp')
                        });
            $scope.controllaDimensioniBkUp()
        }

    }

    $scope.delItemRilievo = function(item, rilievi, id){
        if(item){
            item.rilievi.splice(id, 1);
        }
    }

    $scope.controllaDimensioniBkUp = function(){
        if ($scope.utilsServiceArr.length >= 4){
            //console.log($scope.utilsServiceArr.length)
            $scope.utilsServiceArr
                .$remove($scope.utilsServiceArr[0])
                    .then(function(ref) {
                        // il secondo if potrebbe essere ridondante
                        if ($scope.utilsServiceArr.length >= 4){
                            $scope.controllaDimensioniBkUp()
                        }
                        // data has been deleted locally and in the database
                    }, function(error) {
                        console.log("Error:", error);
                        });

        }
    }




  $scope.open = function(item) {

    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'html/modalEditLocalita.html',
      controller: 'ModalEditLocalitaCtrl',
      size: 'lg',
      resolve: {
        item: function () {
          //console.log(item);
          return item;
        }
      }
    });

    modalInstance.result.then(function (item) {
        if(item.azione=='elimina'){
            console.log('elimina')
            $scope.delItemCampagna(item.item)
        }
        if(item.azione=='salva'){
            console.log('salva')
            $scope.saveCampagna(item.item)
        }
      //$scope.selected = selectedItem;
      //$scope.cambiaData(selectedItem);
    }, function (item) {
//        console.log(item)
        //console.log($scope.numLastModifica)
//        console.log($scope.localitaServiceArr[0])
 //       console.log($scope.localitaServiceArr[0]['listaLocalita'])
        //console.log($scope.localitaServiceArr[0].listaLocalita[item.item.id])        
        //console.log($scope.utilsServiceArr[$scope.utilsServiceArr.length-1].listaLocalita[item.item.id])
      //console.log('Esco dal modal senza far nulla', item)
      var temp = $scope.utilsServiceArr[$scope.utilsServiceArr.length-1].listaLocalita[item.item.id]
      $scope.localitaServiceArr[0].listaLocalita[item.item.id] = temp
      //temp = undefined
//      $log.info('Modal dismissed at: ' + new Date());
    });
  };



    angular.extend($scope, {
        london: {
            lat: 45.455,
            lng: 9.19,
            zoom: 12
        },
        legend: {
            position: 'bottomleft',
            colors: ['rgba(0,0,0,0)',  'rgba(0,0,0,0)','rgba(0,0,0,0)','rgba(0,0,0,0)','rgba(0,0,0,0)','rgba(0,0,0,0)', '#679f22', '#37a8da', '#ff0000'],
            labels: [
            '<span class="fa fa-road" aria-hidden="true" style="margin-left:-25px;margin-top:1px;margin-right:5px;"></span>'+' Analisi mista',
            '<span class="fa fa-car" aria-hidden="true" style="margin-left:-25px;margin-top:10px;margin-right:5px;"></span>'+' Analisi autoveicoli',
            '<span class="fa fa-bicycle" aria-hidden="true" style="margin-left:-25px;margin-right:5px;margin-top:10px;"></span>'+' Analisi biciclette',
            '<span class="fa fa-motorcycle" aria-hidden="true" style="margin-right:5px;margin-left:-25px;margin-top:10px;"></span>'+' Analisi moto',
            '<span class="fa fa-video-camera" aria-hidden="true" style="margin-left:-25px;margin-right:5px;margin-top:10px;"></span>'+ ' Solo video',
            '<hr>',
            'Aggiornamento >= '+ new Date((new Date()).getTime()-(1000*60*60*24*365)).ddmmyyyy(), 
            ' >= '+ new Date((new Date()).getTime()-(1000*60*60*24*365*2)).ddmmyyyy() + ' e < '+ new Date((new Date()).getTime()-(1000*60*60*24*365)).ddmmyyyy(), 
            ' < '+ new Date((new Date()).getTime()-(1000*60*60*24*365*2)).ddmmyyyy()
            ]
        },
        tiles: {
                    url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    options: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
        markers: {
        },
        defaults: {
            scrollWheelZoom: true
        },

    });
/*
<!--
    $scope.campagneService.$loaded().then(function() {
        $scope.caricamentoDati = false
        console.log($scope.campagneService)
        _.each($scope.campagneService, function(num){
            $scope.markers[num.id] = {
                lat: parseFloat(num.lat),
                lng: parseFloat(num.lng),
                'idCampagna': num.$id,
                message: '<strong>'+num.name.toLowerCase()+'</strong>',
                //html: 'Using <strong>Bold text as an icon</strong>:', //+num.name,
                focus: false,
                draggable: false,
                icon: { type: 'awesomeMarker',
                        icon: 'tag',
                        markerColor: 'red'
                },
                'rilievi':num.rilievo,
                'name':num.name.toLowerCase(),
                'id': num.name.hashCode(),
                'active':false
            }
        })

        var a = $scope.markers;


//        $scope.localitaServiceArr.$add({    
//                'listaLocalita': a
 //7           }).then(function(n){
   //             console.log(n)
     //       })

    });

*/

    $scope.zomma = function(item){
        //console.log('evidenzio')
        //item.icon.markerColor = 'gray';
        
        $scope.london.lat = item.lat;
        $scope.london.lng = item.lng;
        $scope.london.zoom = 16;
        
        //
    }

    $scope.statoEvidenziato = function(item){
        $scope.evidenziato = true;
        //console.log('evidenziato', $scope.evidenziato)
    }

    $scope.statoDeEvidenziato = function(item){
        $scope.evidenziato = false;
        //console.log('evidenziato', $scope.evidenziato)
    }

    $scope.evidenzia = function(item){
//        console.log('evidenzio')
//console.log(item)
        //$scope.evidenziato = true;
        item.icon.markerColor = 'gray';
        if($rootScope.followMouse){
        $scope.london.lat = item.lat;
        $scope.london.lng = item.lng;
        //$scope.london.zoom = 14;
        }
        //
    }

    $scope.deEvidenzia = function(item){
        //console.log('deEvidenzio')
        //$scope.evidenziato = false;
        item.icon.markerColor = $scope.checkColor(item);
    }    

    $scope.filtra = function(a){
        //console.log('filtra')
        var filtrato =  _.filter(a, function(num){
            if ($scope.localitaFilter == null){
                //$scope.goto('up')
                return num;}
            if(num.name.indexOf($scope.localitaFilter.toLowerCase()) > -1){
                $('html').animate({scrollTop : 10},10);
                //if (!$scope.evidenziato){$scope.goto('up')}
                //console.log($scope.evidenziato)
                return num;
            }
        })
        //$scope.goto('up')
        return filtrato
    }

    $scope.cancellaFilter = function(){
        $scope.goto('up')
        $scope.localitaFilter = null;
    }

    $scope.checkLocalita = function(){
        if($scope.item2Add.nome!=undefined){
        return (_.find($scope.localitaServiceArr, function(num){
            return _.find(num.listaLocalita, function(num){
                if (num.name == $scope.item2Add.nome) {return true}
                    return false
                })
        }))}
        return false
    }


  })


.controller('ModalEditLocalitaCtrl', function ($scope, $uibModalInstance, item) {

  $scope.item = item;
  $scope.item.icon.prefix = 'fa';
  //console.log(item.rilievi)

  $scope.controlloDateDuplicate = function(r, data){
    var elenco_date = _.filter(r, function(num){
        //console.log(num.giorno, data)
        return num.giorno==data});
    //console.log(elenco_date)
    if (elenco_date.length >1){ return true}
    return false
  }

  $scope.salva = function() {
    $uibModalInstance.close({'azione':'salva', 'item':$scope.item});
  };

  $scope.elimina = function() {
    $uibModalInstance.close({'azione':'elimina', 'item':item});
  };

  $scope.cancel = function () {
    //console.log($scope.item)    
    $uibModalInstance.dismiss({'azione':'dismetti', 'item':item});
  };

    $scope.delItemRilievo = function(i, r, hash){
        var nuovo_vettore = [];
        if(i.rilievi){
            _.each(i.rilievi, function(num){
                if (num.$$hashKey != r.$$hashKey){
                    nuovo_vettore.push(num)
                }
            })
        i.rilievi = nuovo_vettore;
        }
    }

    $scope.addItemRilievo = function(item){
        if ($scope.item.rilievi == undefined) {$scope.item.rilievi = []}
        $scope.item.rilievi.push({'giorno':'1999/01/21', 
                                  'link':'https://linkesempio.com', 
                                  'tipologia':'car', 
                                  'video':[]
                                   })
    }

    $scope.addItemVideo = function(item){
        //console.log(item)
        if (!item.video) {
            item.video = []
            //console.log('aggiungo vettore')
        }
        item.video.push({'ord':0, 
                         'ora_inizio':'08:00:00', 
                         'ora_fine':'07:00:00', 
                         'link':'https://linkesempio.com'
                        })
    }

    $scope.delItemVideo = function(item, v){
        //console.log(item, v)
        var newVideo = []
        _.each(item.video, function(num){
            if (num.link != v){newVideo.push(num)} 
        })
        //console.log(newVideo)
        item.video = newVideo;
    }

    $scope.$on('leafletDirectiveMarker.dragend', function(e, args) {
            $scope.item.lat = args.model.lat
            $scope.item.lng = args.model.lng
    });


    angular.extend($scope, {
        london: {
            lat: parseFloat($scope.item.lat),
            lng: parseFloat($scope.item.lng),
            zoom: 18
        },
        tiles: {
                    url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    options: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
        markers: [{lat: parseFloat($scope.item.lat),
                   lng: parseFloat($scope.item.lng),
                        message: '<strong>'+$scope.item.name.toLowerCase()+'</strong>',
                        focus: false,
                        draggable: true,
                        icon: { type: 'awesomeMarker',
                                icon: 'pencil',
                                prefix:'fa',
                                markerColor: 'orange'
                        }
                        
                        
                        }],
        defaults: {
            scrollWheelZoom: true
        },

    })

 })
.controller('RilievoCtrl', function ($scope, $sce,$window, $rootScope,$state, $stateParams,  localitaServiceArr) {
    $scope.showSpinner = true;

    // In your controller
    var w = angular.element($window);
    $scope.$watch(
      function () {
        return $window.innerWidth;
      },
      function (value) {
        $scope.windowWidth = value;
      },
      true
    );

    w.bind('resize', function(){
      $scope.$apply();
    });

    $scope.dim = function(){
        console.log($scope.windowWidth/3.6)
        if ($scope.windowWidth >= 1200){
            return $scope.windowWidth/3.6
        }
        if ($scope.windowWidth >= 992){
            return $scope.windowWidth/2.4
        }
        if ($scope.windowWidth >= 768){
            return $scope.windowWidth/2.4
        }    
        return $scope.windowWidth/1.2
    }

    $scope.toMappa = function(id){
        $rootScope.focusCampagna(id)
        $state.go('app.home')
    }

    $scope.convertiLaData = function(d){
        //console.log('ciaooi', d)
        var g =  new Date(d)
        return g

    }

    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    }

    $scope.localitaServiceArr = localitaServiceArr

    $scope.localitaServiceArr.$loaded().then(function() {
        $scope.localitaDet = $scope.localitaServiceArr[0].listaLocalita[$stateParams.campagnaId]
   //     console.log($scope.localitaDet)
        $scope.rilievoDet = _.find($scope.localitaDet.rilievi, 
            function(num){
                return $rootScope.convertiDataInt(num.giorno) == $stateParams.rilievoId
            }
            )
        $scope.it= $scope.rilievoDet;
        $scope.showSpinner =false;
    });
});
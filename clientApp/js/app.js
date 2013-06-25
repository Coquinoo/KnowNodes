'use strict';


// Declare app level module which depends on filters, and services
/*angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
 config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
 $routeProvider.when('/view1', {templateUrl: 'partials/partial1', controller: MyCtrl1});
 $routeProvider.when('/view2', {templateUrl: 'partials/partial2', controller: MyCtrl2});
 $routeProvider.otherwise({redirectTo: '/view1'});
 $locationProvider.html5Mode(true);
 }]);
 */
// Declare app level module which depends on filters, and services
var KnowNodesAppModule = angular.module('KnowNodesApp', ['firebase','ngSanitize', 'ui', 'ui.directives', '$strap', 'KnowNodesApp.filters', 'KnowNodesApp.services', 'KnowNodesApp.directives', 'ui.bootstrap', 'ui.select2']).
    config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/frontPage',
                controller: IndexCtrl
            }).
            when('/about', {
                templateUrl: 'partials/about',
                controller: AboutCtrl
            }).
            when('/terms', {
                templateUrl: 'partials/terms',
                controller: TermsCtrl
            }).
            when('/login', {
                templateUrl: 'partials/User/login',
                controller: LoginCtrl
            }).
            when('/logout', {
                templateUrl: 'partials/User/login',
                controller: LogoutCtrl
            }).
            when('/addUser', {
                templateUrl: 'partials/User/addUser',
                controller: AddUserCtrl
            }).
            when('/deleteUser/:id', {
                templateUrl: 'partials/User/deleteUser',
                controller: DeleteUserCtrl
            }).
            when('/addConcept', {
                templateUrl: 'partials/KnownodePost/addConcept',
                controller: AddConceptCtrl
            }).
            when('/editConcept/:id', {
                templateUrl: 'partials/KnownodePost/editConcept',
                controller: EditConceptCtrl
            }).
            when('/conceptList', {
                templateUrl: 'partials/KnownodePost/conceptList',
                controller: ConceptListCtrl
            }).
            when('/map/:id', {
                templateUrl: 'partials/KnownodePost/map',
                controller: MapCtrl
            }).
            when('/concept/:id', {
                templateUrl: 'partials/KnownodePost/knownodeList',
                controller: KnownodeListCtrl
                //controller: ConceptListCtrl
            }).
            when('/addKnownodeTo/:id', {
                templateUrl: 'partials/KnownodePost/addPostURL',
                controller: AddPostCtrl
            }).
            when('/editKnownode/:id', {
                templateUrl: 'partials/KnownodePost/addPostURL',
                controller: EditPostCtrl
            }).
            when('/article/:id', {
                templateUrl: 'partials/KnownodePost/knownodeList',
                controller: KnownodeListCtrl
            }).
            when('/edge/:id', {
                templateUrl: 'partials/KnownodePost/edgePage',
                controller: EdgeCtrl
            }).
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    }])
    .run(function($rootScope) {
        $rootScope.$watch('user', function(newValue, oldValue) {
            if(newValue) {
                $rootScope.userDisplayName = newValue.firstName + ' ' + newValue.lastName;
            }
        },
        true);

        if(KN) {
            $rootScope.user = KN.initAngularUser();
        }
    });


KnowNodesAppModule.value('ui.config', {
    select2: {
        allowClear: true
    },
    tinymce: {
        theme : "advanced",
        theme_advanced_toolbar_location : "top",
        theme_advanced_buttons1 : "bold,italic,underline,link,unlink,",
        theme_advanced_buttons2 : "",
        theme_advanced_buttons3 : "",
        theme_advanced_statusbar_location : "none",
        setup : function(ed) {
            ed.onInit.add(function(ed)
            {
                var e = ed.getBody();
                e.style.fontSize='14px';
                e.style.fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif";
                e.style.fontWeight='normal';
            });
        }

    }
});
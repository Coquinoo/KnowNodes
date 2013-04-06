'use strict';

/* Directives */

angular.module('KnowNodesApp.directives', [])
    .directive('subtitle', function() {
        return {
            restrict: "A",
            templateUrl: 'partials/directiveTemplates/subtitle',
            replace: true
        };
    })
    .directive('concept', function() {
            return {
                restrict: 'EAC',
                transclude: true,
                templateUrl: 'partials/directiveTemplates/concept',
                replace: true
            };
        })
    .directive('edgeTypeSelector', function() {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/edgeTypeSelector',
            replace: true
        };
    })
    .directive('formatSelector', function() {
        return {
            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope) {
                        scope.resourceFormats = [
                            'Text',
                            'URL',
                            'File'];
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        $(function() {
                            $('#createResourceTabs_' + iAttrs.direction + ' a:first').tab('show');
                        });
                    }
                };
            },
            restrict: 'EAC',
            scope: {
                resourceDirection: '@direction'
            },
            templateUrl: 'partials/directiveTemplates/formatSelector',
            replace: true
        };
    })
    .directive('resourceTypeSelector', function() {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/resourceTypeSelector',
            replace: true
        };
    })
    .directive('knowledgeDomainSelector', function() {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/knowledgeDomainSelector',
            replace: true
        };
    })
    .directive('node', function() {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/node',
            replace: true
        };
    })
    .directive('fullNode', function() {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/fullNode',
            replace: true
        };
    })
    .directive('conceptNode', function() {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/conceptNode',
            replace: true
        };
    })
    .directive('targetArticle', function() {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/targetArticle',
            replace: true
        };
    })
    .directive('edge', function() {
        return {
            restrict: 'EAC',
            transclude: true,
            templateUrl: 'partials/directiveTemplates/edge',
            replace: true
        };
    })
    .directive('navBarTop', function() {
        return {
            restrict: 'AC',
            transclude: true,
            scope: {
                'title': '@title'
            },
            templateUrl: 'partials/directiveTemplates/navBarTop',
            replace: true
        };
    })

    .directive('navLocation', function($location) {
        return {
            restrict: 'AC',
            transclude: true,
            scope: {
                'href': '@'
            },
            link: function (scope) {
                scope.location = function (href) {
                    return href.substr(1) === $location.url().substr(1);
                };
            },
            templateUrl: 'partials/directiveTemplates/navLocation',
            replace: true
        };
    })

    .directive('topBarLogin', function($location, $rootScope) {
        return {
            restrict: 'AC',
            transclude: true,
            scope: {
                'href': '@'
            },
            link: function (scope) {
                scope.location = function (href) {
                    return href.substr(1) === $location.url().substr(1);
                };

                scope.isLoggedIn = function() {
                    return $rootScope.user;
                }

                scope.userDisplayName = function() {
                    return $rootScope.userDisplayName;
                }
            },
            templateUrl: 'partials/directiveTemplates/topBarLogin',
            replace: true
        };
    })
    .directive('appVersion', ['version', function(version)
    {
        return function(scope, elm, attrs) {
          elm.text(version);
        };
    }])

    .directive('commentSection', ['$http', function($http) {
        return {
            restrict: 'EAC',
            scope: {
                'knownodeId': '='
            },
            templateUrl: 'partials/directiveTemplates/commentList',
            link: function(scope, iElement, iAttrs, controller) {

            },
            replace: true
        };
    }])
    .directive('ngFocus', function($timeout) {
        return {
            link: function ( scope, element, attrs ) {
                scope.$watch( attrs.ngFocus, function ( val ) {
                    if ( angular.isDefined( val ) && val ) {
                        $timeout( function () { element[0].focus(); } );
                    }
                }, true);

                element.bind('blur', function () {
                    if ( angular.isDefined( attrs.ngFocusLost ) ) {
                        scope.$apply( attrs.ngFocusLost );

                    }
                });
            }
        };
    })
    .directive('userAutoComplete', ['$http', function($http) {
        return function(scope, element, attrs) {
            element.userAutoComplete({
                minLength:3,
                source:function (request, response) {
                    $http.get('/api/users/' + request.term).success( function(data) {
                        response(data.results);
                    });
                },
                focus:function (event, ui) {
                    element.val(ui.item.label);
                    return false;
                },
                select:function (event, ui) {
                    scope.myModelId.selected = ui.item.value;
                    scope.$apply;
                    return false;
                },
                change:function (event, ui) {
                    if (ui.item === null) {
                        scope.myModelId.selected = null;
                    }
                }
            }).data("autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
                    .data("item.autocomplete", item)
                    .append("<a>" + item.label + "</a>")
                    .appendTo(ul);
            };
            };
    }]);

'use strict';

angular.module('KnowNodesApp.services', [])

    .factory('userService', function ($rootScope, $http, $q) {
        return {

            create: function (userData) {
                return $http.post('/users', userData);
            },

            login: function (data) {
                var deferred = $q.defer();
                var promise = $http.post('/login', data);
                promise.then(function(result) {
                    var user = result.data;
                    $http.get('/users/' + user.KN_ID + '/karma').then(function(karma) {
                        user.karma = karma.data.karma;
                        deferred.resolve(user);
                    });
                });
                return deferred.promise;
            },

            logout: function () {
                return $http.post('/logout');
            },

            isUserLoggedIn: function () {
                return $rootScope.user
            },

            getConnectedUser: function () {
                if ($rootScope.user) {
                    $rootScope.user.displayName = serviceReturned.getUserDisplayName();
                }
                return $rootScope.user;
            },

            getUserDisplayName: function () {
                if ($rootScope.user !=null) {
                    return $rootScope.user.firstName + " " + $rootScope.user.lastName;
                }
                return '';
            }

        };
    })

    .factory('PassKnownode', function () {
        var currentEdge;
        var PassKnownodeService = {};
        PassKnownodeService.changeCurrent = function (data) {
            currentEdge = data;
        };
        PassKnownodeService.showCurrent = function () {
            return currentEdge;

        };
        return PassKnownodeService;
    })

    .factory('broadcastService', function ($rootScope) {
        var serviceReturned = {};

        serviceReturned.message = '';

        serviceReturned.prepForBroadcast = function (msg) {
            this.message = msg;
            this.broadcastItem();
        };

        serviceReturned.broadcastItem = function () {
            $rootScope.$broadcast('handleBroadcast');
        };

        return serviceReturned;
    })

    .factory('nowTime', ['$timeout', function ($timeout) {
        var nowTime;
        (function updateTime() {
            nowTime = Date.now();
            $timeout(updateTime, 1000);
        }());
        return function () {
            return nowTime;
        };
    }])

    .factory('hybridSearch', ['$http', '$q', function ($http, $q) {

        var wikiBaseUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srprop=snippet&format=json&callback=JSON_CALLBACK&srsearch=';

        return {

            search: function (query) {

                var handleResultsFromWikipedia = function (result) {
                    if (result.data.query != null)
                        return result.data.query.search;
                    else return {};
                };

                var deferred = $q.defer();
                $q.all([$http.get('/resources/' + query + '/searchByKeyword'),
                        $http.jsonp(wikiBaseUrl + query)])
                    .then(function (results) {
                        var resources = results[0].data;
                        var wikipediaArticles = handleResultsFromWikipedia(results[1]);
                        deferred.resolve({resources: resources, wikipediaArticles: wikipediaArticles});
                    });
                // TODO Handle Errors
                return deferred.promise;
            }

        };
    }])

    .factory('resource', ['$http', '$q', 'wikipedia', function ($http, $q, wikipedia) {

        var getResourceWithWikipediaLinks = function (id) {
            return $http.get('/resources/' + id).then(addWikipediaLinks);
        }

        var addWikipediaLinks = function (result) {
            var resource = result.data;
            var deferred = $q.defer();
            wikipedia.getArticle(resource.title).then(function (article) {
                if (article != null) {
                    resource.wikipediaLinks = article.links;
                }
                deferred.resolve(resource);
            });
            return deferred.promise;
        }

        var getConnections = function (id) {
            return $http.get('/resources/' + id + '/triplets');
        }

        // TODO Use this to remove duplicates between KN and Wikipedia results
        function binarySearch(title, inputArray) {
            var low = 0,
                high = inputArray.length - 1,
                mid;
            while (low <= high) {
                mid = low + (high - low) / 2;
                if ((mid % 1) > 0) {
                    mid = Math.ceil(mid);
                }
                if (title < inputArray[mid]) {
                    high = mid - 1;
                }
                else if (title < inputArray[mid]) {
                    low = mid + 1;
                }
                else {
                    return mid;
                }
            }
            return null;
        }

        return {

            get: function (id) {
                var deferred = $q.defer();

                $q.all([getResourceWithWikipediaLinks(id),
                        getConnections(id)])
                    .then(function (results) {
                        var resource = results[0];
                        var connections = results[1].data;
                        resource.relations = connections;
                        deferred.resolve(resource);
                    });
                // TODO Handle Errors
                return deferred.promise;
            },

            create: function (resourceData) {
                var deferred = $q.defer();
                $http.post('/resources', resourceData)
                    .success(function (data, status, headers, config) {
                        console.log("resourceData:", data);
                        deferred.resolve(data)
                        console.log("resourceDataresolved:", data);


                    })
                    .error(function (data, status, headers) {
                        console.log('Resource creation failed with error code : ' + status);
                        console.log('Error message : ' + data.message);
                        deferred.resolve(null);
                    });
                ;
                console.log("resourcePromise:", deferred.promise);

                return deferred.promise;

            },

            delete: function (id) {
                // TODO Implement
                alert('Not implemented')
                //return $http.delete('/resources/' + id)
                //    .error(function (data, status) {
                //        console.log('Resource deletion failed with error code : ' + status);
                //        console.log('Error message : ' + data.message);
                //    });
            },

            findByUrl: function(url) {
                return $http.post('/resources/findByUrl', {url: url});
            }

        }
    }])

    .factory('wikipedia', ['$http', '$q', function ($http, $q) {

        var baseUrl = 'http://en.wikipedia.org/w/api.php?action=query&prop=extracts|links&pllimit=500&format=json&redirects&callback=JSON_CALLBACK&titles=';

        var getFirstParagraph = function (extract) {
            var regex = /<p>.+<\/p>/;
            var split = regex.exec(extract);
            if (split === null || split.length === 0) return '';
            else return split[0];
        }

        return {

            getArticle: function (title) {
                var deferred = $q.defer();
                $http.jsonp(baseUrl + title)
                    .success(function (data) {
                        var article = data.query.pages[Object.keys(data.query.pages)[0]];
                        article.extract = getFirstParagraph(article.extract)
                        deferred.resolve(article);
                    })
                    .error(function (data, status, headers) {
                        console.log('Fetching Wikipedia article failed with error code : ' + status);
                        console.log('Error message : ' + data.message);
                        deferred.resolve(null);
                    });
                return deferred.promise;
            }

        };
    }])

    .factory('wikinode', ['$http', function ($http) {
        return {

            get: function (title) {
                return $http.get('/wiki/' + title);
            },

            getOrCreate: function (title) {
                return $http.post('/wiki', {title: title});
            }

        };
    }])

    .factory('connection', ['$http', function ($http) {
        return {

            create: function (startId, connectionTitle, connectionType, endId) {
                var request = {
                    title: connectionTitle,
                    connectionType: connectionType,
                    fromNodeId: startId,
                    toNodeId: endId
                };
                return $http.post('/connections', request);
            }

        };
    }])

    .factory('resourceModal', ['$dialog', function ($dialog) {
        return {

            open: function (resourceTitle) {
                var options = {
                    backdrop: true,
                    dialogFade: true,
                    backdropFade: true,
                    templateUrl: 'partials/resource/createResourceModal',
                    controller: 'CreateResourceModalCtrl',
                    title: resourceTitle
                };
                return $dialog.dialog(options).open();
            }

        };
    }])


    .factory('loginModal', ['$dialog', function ($dialog) {
        return {

            open: function () {
                var options = {
                    backdrop: true,
                    dialogFade: true,
                    backdropFade: true,
                    templateUrl: 'partials/directiveTemplates/loginModal',
                    controller: 'LoginCtrl'
                };
                return $dialog.dialog(options).open();
            },

            close: function () {
                var options = {
                    backdrop: true,
                    dialogFade: true,
                    backdropFade: true,
                    templateUrl: 'partials/directiveTemplates/loginModal',
                    controller: 'LoginCtrl'
                };
                return $dialog.dialog(options).close();
            }
        };
    }])

    .factory('scrape', ['$http', function ($http) {
        return {

            url: function (url) {
                return $http.post('/scrape', {url: url});
            }
        };
    }])

    .value('version', '0.2');

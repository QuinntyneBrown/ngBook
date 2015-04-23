var app;
(function (app) {
    var security;
    (function (security) {
        "use strict";
        var AuthenticatedController = (function () {
            function AuthenticatedController($location, $timeout, token) {
                var _this = this;
                this.$location = $location;
                this.$timeout = $timeout;
                this.token = token;
                this.canActivate = function () {
                    if (_this.token.get())
                        return true;
                    _this.promise = _this.$timeout(function () {
                        _this.$location.path("/login");
                    }, 0);
                    return false;
                };
            }
            return AuthenticatedController;
        })();
        security.AuthenticatedController = AuthenticatedController;
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=authenticatedController.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        var DataService = (function () {
            function DataService($http, $q, _baseUri, entityName, storage) {
                var _this = this;
                this.$http = $http;
                this.$q = $q;
                this._baseUri = _baseUri;
                this.entityName = entityName;
                this.storage = storage;
                this.getById = function (id) {
                    return _this.fromCacheOrService({ method: "GET", uri: _this.baseUri + "/getbyid", params: { id: id } });
                };
                this.getAll = function () {
                    return _this.fromCacheOrService({ method: "GET", uri: _this.baseUri + "/getAll" });
                };
                this.fromCacheOrService = function (action) {
                    var deferred = _this.$q.defer();
                    var cachedData = _this.storage.getByName({ name: action.uri + JSON.stringify(action.params) });
                    if (!cachedData || !cachedData.value) {
                        _this.$http({ method: action.method, url: action.uri, data: action.data, params: action.params }).then(function (results) {
                            _this.storage.put({ category: _this.entityName, name: action.uri + JSON.stringify(action.params), value: results });
                            deferred.resolve(results);
                        }).catch(function (error) {
                            deferred.reject(error);
                        });
                    }
                    else {
                        deferred.resolve(cachedData.value);
                    }
                    return deferred.promise;
                };
                this.add = function (entity) {
                    var deferred = _this.$q.defer();
                    _this.$http({ method: "POST", url: _this.baseUri + "/add", data: entity }).then(function (results) {
                        _this.invalidateCache();
                        deferred.resolve(results);
                    }).catch(function (error) {
                        deferred.reject(error);
                    });
                    return deferred.promise;
                };
                this.update = function (entity) {
                    var deferred = _this.$q.defer();
                    _this.$http({ method: "PUT", url: _this.baseUri + "/update", data: JSON.stringify(entity) }).then(function (results) {
                        _this.invalidateCache();
                        deferred.resolve(results);
                    }).catch(function (error) {
                        deferred.reject(error);
                    });
                    return deferred.promise;
                };
                this.remove = function (id) {
                    var deferred = _this.$q.defer();
                    _this.$http({ method: "DELETE", url: _this.baseUri + "/remove?id=" + id }).then(function (results) {
                        _this.invalidateCache();
                        deferred.resolve(results);
                    }).catch(function (error) {
                        deferred.reject(error);
                    });
                    return deferred.promise;
                };
                this.invalidateCache = function () {
                    _this.storage.get().forEach(function (item) {
                        if (item.category === _this.entityName) {
                            _this.storage.put({ name: item.name, value: null });
                        }
                    });
                };
            }
            Object.defineProperty(DataService.prototype, "baseUri", {
                get: function () {
                    return this._baseUri + "/" + this.entityName;
                },
                enumerable: true,
                configurable: true
            });
            return DataService;
        })();
        common.DataService = DataService;
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=dataService.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        var Entity = (function () {
            function Entity($location, $q, fire, dataService, entityName) {
                var _this = this;
                this.$location = $location;
                this.$q = $q;
                this.fire = fire;
                this.dataService = dataService;
                this.entityName = entityName;
                this.getById = function (id) {
                    var deferred = _this.$q.defer();
                    _this.dataService.getById(id).then(function (results) {
                        var entity = null;
                        _this.instance(results.data).then(function (results) {
                            entity = results;
                            deferred.resolve(entity);
                        });
                    });
                    return deferred.promise;
                };
                this.getAll = function () {
                    var deferred = _this.$q.defer();
                    _this.dataService.getAll().then(function (results) {
                        var entities = [];
                        var promises = [];
                        results.data.forEach(function (result) {
                            promises.push(_this.instance(result));
                        });
                        _this.$q.all(promises).then(function (allResults) {
                            allResults.forEach(function (result) {
                                entities.push(result);
                            });
                            deferred.resolve(entities);
                        });
                    });
                    return deferred.promise;
                };
                this.save = function () {
                    var deferred = _this.$q.defer();
                    var promises = [];
                    var action;
                    if (_this.isValid()) {
                        if (_this.id) {
                            action = "update";
                            promises.push(_this.dataService.update(_this));
                        }
                        else {
                            action = "add";
                            promises.push(_this.dataService.add(_this));
                        }
                    }
                    else {
                        deferred.reject();
                    }
                    _this.$q.all(promises).then(function (results) {
                        _this.instance(results[0].data).then(function (results) {
                            _this.fire(document.getElementsByTagName("body")[0], _this.entityName + "Saved", { entity: _this, action: action });
                            deferred.resolve();
                        });
                    }).catch(function () {
                        deferred.reject();
                    });
                    return deferred.promise;
                };
                this.remove = function () {
                    var deferred = _this.$q.defer();
                    if (_this.id) {
                        _this.dataService.remove(_this.id).then(function () {
                            _this.fire(document.getElementsByTagName("body")[0], _this.entityName + "Removed", { entity: _this, action: "remove" });
                            deferred.resolve();
                        });
                    }
                    else {
                        deferred.reject();
                    }
                    return deferred.promise;
                };
                this.isValid = function () {
                    if (_this.getValidationErrors().length < 1) {
                        return true;
                    }
                    return false;
                };
                this.instance = function (data) {
                    throw new Error("Not Implemented");
                };
                this.getValidationErrors = function () {
                    throw new Error("Not Implemented");
                };
                this.id = 0;
                this.isDeleted = false;
            }
            return Entity;
        })();
        common.Entity = Entity;
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=entity.js.map
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        var StorageProperty = (function () {
            function StorageProperty(storage, name) {
                var _this = this;
                this.storage = storage;
                this.name = name;
                this.get = function () {
                    if (_this.data) {
                        return _this.data;
                    }
                    try {
                        _this.data = _this.storage.getByName({ name: _this.name }).value;
                    }
                    catch (error) {
                    }
                    return _this.data;
                };
                this.set = function (params) {
                    _this.data = params.data;
                    _this.storage.put({ name: _this.name, value: params.data });
                };
            }
            return StorageProperty;
        })();
        common.StorageProperty = StorageProperty;
        var SessionStorageProperty = (function (_super) {
            __extends(SessionStorageProperty, _super);
            function SessionStorageProperty($rootScope, storage, name) {
                var _this = this;
                _super.call(this, storage, name);
                this.$rootScope = $rootScope;
                this.storage = storage;
                this.name = name;
                this.onLocationChangeStart = function (event, newState) {
                    if (newState.indexOf("/login") > 0) {
                        _this.data = null;
                        _this.set({ data: null });
                    }
                };
                $rootScope.$on("$locationChangeStart", this.onLocationChangeStart);
            }
            return SessionStorageProperty;
        })(StorageProperty);
        common.SessionStorageProperty = SessionStorageProperty;
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=sessionStorageProperty.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        var Storage = (function () {
            function Storage(storageId) {
                var _this = this;
                this.storageId = storageId;
                this.instance = function (storageId) {
                    return new Storage(storageId);
                };
                this.get = function () {
                    return JSON.parse(localStorage.getItem(_this.storageId) || "[]");
                };
                this.getByName = function (params) {
                    var items = JSON.parse(localStorage.getItem(_this.storageId) || "[]");
                    var storageItem = null;
                    items.forEach(function (item) {
                        if (params.name === item.name) {
                            storageItem = item;
                        }
                    });
                    return storageItem;
                };
                this.put = function (params) {
                    var items = JSON.parse(localStorage.getItem(_this.storageId) || "[]");
                    var itemExist = false;
                    items.forEach(function (item) {
                        if (params.name === item.name) {
                            itemExist = true;
                            item.value = params.value;
                            item.category = params.category;
                            localStorage.setItem(_this.storageId, JSON.stringify(items));
                        }
                    });
                    if (!itemExist) {
                        items.push(params);
                        localStorage.setItem(_this.storageId, JSON.stringify(items));
                    }
                };
            }
            return Storage;
        })();
        common.Storage = Storage;
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=storage.js.map


//# sourceMappingURL=../collection/collection.module.js.map
var app;
(function (app) {
    var book;
    (function (book) {
        angular.module("app.book", [
            "ngNewRouter",
            "ngAnimate",
            "app.common",
            "app.security",
            "app.ui"
        ]).config([
            "$componentLoaderProvider",
            "$httpProvider",
            "$locationProvider",
            "apiEndpointProvider",
            "featureComponentsMappingsProvider",
            "loginRedirectProvider",
            "routesProvider",
            config
        ]);
        function config($componentLoaderProvider, $httpProvider, $locationProvider, apiEndpointProvider, featureComponentsMappingsProvider, loginRedirectProvider, routesProvider) {
            loginRedirectProvider.setDefaultUrl("/books");
            featureComponentsMappingsProvider.mappings.push({
                feature: "book",
                components: ["bookAbout", "books", "book", "bookForm"]
            });
            routesProvider.configure([
                { path: '/', redirectTo: '/login' },
                { path: '/book/about', component: 'bookAbout' },
                { path: '/book/list', component: 'books' },
                { path: '/book/detail/:toDoId', component: 'book' },
                { path: '/book/create', component: 'bookForm' },
                { path: '/book/edit/:toDoId', component: 'bookForm' }
            ]);
            apiEndpointProvider.configure("/api");
        }
    })(book = app.book || (app.book = {}));
})(app || (app = {}));

//# sourceMappingURL=../book/book.module.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        angular.module("app.common", []);
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=../common/common.module.js.map


//# sourceMappingURL=../favoriteList/favoriteList.module.js.map
var app;
(function (app) {
    var security;
    (function (security) {
        angular.module("app.security", [
            "app.common",
            "app.ui"
        ]).config(["apiEndpointProvider", "featureComponentsMappingsProvider", "routesProvider", config]);
        function config(apiEndpointProvider, featureComponentsMappingsProvider, routesProvider) {
            apiEndpointProvider.configure("/login", "login");
            featureComponentsMappingsProvider.mappings.push({
                feature: "security",
                components: ["login"]
            });
            routesProvider.configure([
                { path: '/login', component: 'login' }
            ]);
        }
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=../security/security.module.js.map


//# sourceMappingURL=../userManagement/userManagement.module.js.map
var app;
(function (app) {
    var ui;
    (function (ui) {
        angular.module("app.ui", []);
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));

//# sourceMappingURL=../ui/ui.module.js.map
var app;
(function (app) {
    var book;
    (function (book) {
        "use strict";
        var BookAppController = (function () {
            function BookAppController($interval, $location, $rootScope, $router, currentUser, routes, securityService, token) {
                var _this = this;
                this.$interval = $interval;
                this.$location = $location;
                this.$rootScope = $rootScope;
                this.$router = $router;
                this.currentUser = currentUser;
                this.routes = routes;
                this.securityService = securityService;
                this.token = token;
                this.isLoggedIn = function () {
                    return _this.token.get();
                };
                this.getUsername = function () {
                    var currentUser = _this.currentUser.get();
                    if (currentUser)
                        return currentUser.firstname + ' ' + currentUser.lastname;
                    return null;
                };
                $router.config(routes);
                $interval(function () {
                    if (securityService.tokenExpired()) {
                        //if(this.currentRouteRequiresAuthentication()) {
                        //  this.loginRedirect.lastPath = this.$location.path();
                        //  this.$location.path('/login');
                        //}
                        $location.path("/login");
                    }
                }, 6000);
            }
            return BookAppController;
        })();
        angular.module("app.book").controller("bookAppController", ["$interval", "$location", "$rootScope", "$router", "currentUser", "routes", "securityService", "token", BookAppController]);
    })(book = app.book || (app.book = {}));
})(app || (app = {}));

//# sourceMappingURL=../../book/controllers/bookAppController.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        angular.module("app.common").value("bind", function (element, object) {
            if (element) {
                for (var events in object) {
                    var callback = object[events];
                    events.split(/\s+/).forEach(function (event) {
                        element.addEventListener(event, callback);
                    });
                }
            }
        });
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=../../common/functions/bind.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        angular.module("app.common").value("fire", function (target, type, properties) {
            var htmlEvent = document.createEvent("HTMLEvents");
            htmlEvent.initEvent(type, true, true);
            for (var j in properties) {
                htmlEvent[j] = properties[j];
            }
            target.dispatchEvent(htmlEvent);
        });
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=../../common/functions/fire.js.map
var app;
(function (app) {
    var security;
    (function (security) {
        "use strict";
        var LoginController = (function () {
            function LoginController() {
            }
            return LoginController;
        })();
        angular.module("app.security").controller("loginController", [LoginController]);
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=../../security/controllers/loginController.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        var ApiEndpointProvider = (function () {
            function ApiEndpointProvider() {
                var _this = this;
                this.config = {
                    getBaseUrl: function (name) {
                        var baseUrl = "";
                        if (name) {
                            _this.config.baseUrls.forEach(function (endpointDefinition) {
                                if (name === endpointDefinition.name) {
                                    baseUrl = endpointDefinition.url;
                                }
                            });
                        }
                        if (!name || baseUrl === "") {
                            _this.config.baseUrls.forEach(function (endpointDefinition) {
                                if (!endpointDefinition.name && baseUrl === "") {
                                    baseUrl = endpointDefinition.url;
                                }
                            });
                        }
                        return baseUrl;
                    },
                    baseUrls: [{ url: "/api" }]
                };
            }
            ApiEndpointProvider.prototype.configure = function (baseUrl, name) {
                this.config.baseUrls.push({ url: baseUrl, name: name });
            };
            ApiEndpointProvider.prototype.$get = function () {
                return this.config;
            };
            return ApiEndpointProvider;
        })();
        common.ApiEndpointProvider = ApiEndpointProvider;
        angular.module("app.common").provider("apiEndpoint", ApiEndpointProvider);
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=../../common/services/apiEndpointProvider.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        var FeatureComponentsMappingsProvider = (function () {
            function FeatureComponentsMappingsProvider() {
                var _this = this;
                this.mappings = [];
                this.setTemplateMapping = function ($componentLoaderProvider) {
                    $componentLoaderProvider.setTemplateMapping(function (name) {
                        var viewLocation = null;
                        _this.mappings.forEach(function (mapping) {
                            mapping.components.forEach(function (component) {
                                if (name === component) {
                                    viewLocation = "src/app/" + mapping.feature + "/views/" + name + ".html";
                                }
                            });
                        });
                        return viewLocation;
                    });
                };
            }
            FeatureComponentsMappingsProvider.prototype.$get = function () {
                return this.mappings;
            };
            return FeatureComponentsMappingsProvider;
        })();
        common.FeatureComponentsMappingsProvider = FeatureComponentsMappingsProvider;
        angular.module("app.common").provider("featureComponentsMappings", FeatureComponentsMappingsProvider).config([
            "$componentLoaderProvider",
            "featureComponentsMappingsProvider",
            function ($componentLoaderProvider, featureComponentsMappingsProvider) {
                featureComponentsMappingsProvider.setTemplateMapping($componentLoaderProvider);
                $componentLoaderProvider.setCtrlNameMapping(function (name) {
                    return name[0].toLowerCase() + name.substr(1) + "Controller";
                });
            }
        ]);
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=../../common/services/featureComponentsMappingsProvider.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        var formEncode = function () {
            return function (data) {
                var pairs = [];
                for (var name in data) {
                    pairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
                }
                return pairs.join('&').replace(/%20/g, '+');
            };
        };
        angular.module("app.common").factory("formEncode", formEncode);
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=../../common/services/formEncode.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        var HistoryService = (function () {
            function HistoryService() {
            }
            return HistoryService;
        })();
        angular.module("app.common").service("historyService", [HistoryService]);
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=../../common/services/historyService.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        var NotificationService = (function () {
            function NotificationService() {
            }
            return NotificationService;
        })();
        angular.module("app.common").service("notificationService", [NotificationService]);
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=../../common/services/notificationService.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        var RequestCounter = (function () {
            function RequestCounter($q) {
                var _this = this;
                this.$q = $q;
                this.requests = 0;
                this.request = function (config) {
                    _this.requests += 1;
                    return _this.$q.when(config);
                };
                this.requestError = function (error) {
                    _this.requests -= 1;
                    return _this.$q.reject(error);
                };
                this.response = function (response) {
                    _this.requests -= 1;
                    return _this.$q.when(response);
                };
                this.responseError = function (error) {
                    _this.requests -= 1;
                    return _this.$q.reject(error);
                };
                this.getRequestCount = function () {
                    return _this.requests;
                };
            }
            RequestCounter.instance = function ($q) {
                return new RequestCounter($q);
            };
            return RequestCounter;
        })();
        angular.module("app.common").factory("requestCounter", ["$q", RequestCounter.instance]).config([
            "$httpProvider",
            function ($httpProvider) {
                $httpProvider.interceptors.push("requestCounter");
            }
        ]);
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=../../common/services/requestCounter.js.map
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        var RoutesProvider = (function () {
            function RoutesProvider() {
                var _this = this;
                this.routes = [];
                this.configure = function (routes) {
                    routes.forEach(function (route) {
                        _this.routes.push(route);
                    });
                };
            }
            RoutesProvider.prototype.$get = function () {
                return this.routes;
            };
            return RoutesProvider;
        })();
        angular.module("app.common").provider("routes", RoutesProvider);
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=../../common/services/routesProvider.js.map
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var app;
(function (app) {
    var common;
    (function (common) {
        "use strict";
        var CommonStorage = (function (_super) {
            __extends(CommonStorage, _super);
            function CommonStorage($rootScope) {
                var _this = this;
                _super.call(this, "commonLocalStorage");
                $rootScope.$on("$locationChangeStart", function (event, newState) {
                    if (newState.indexOf("/login") > 0) {
                        _this.get().forEach(function (item) {
                            _this.put({ name: item.name, value: null });
                        });
                    }
                });
            }
            return CommonStorage;
        })(common.Storage);
        angular.module("app.common").service("storage", ["$rootScope", CommonStorage]);
    })(common = app.common || (app.common = {}));
})(app || (app = {}));

//# sourceMappingURL=../../common/services/storage.js.map
var app;
(function (app) {
    var security;
    (function (security) {
        "use strict";
        var AuthorizationInterceptor = (function () {
            function AuthorizationInterceptor(token) {
                var _this = this;
                this.token = token;
                this.request = function (config) {
                    if (_this.token.get()) {
                        config.headers.Authorization = "Bearer " + _this.token.get();
                    }
                    return config;
                };
            }
            AuthorizationInterceptor.instance = function (token) {
                return new AuthorizationInterceptor(token);
            };
            return AuthorizationInterceptor;
        })();
        angular.module("app.security").factory("authorizationInterceptor", ["token", AuthorizationInterceptor.instance]).config([
            "$httpProvider",
            function ($httpProvider) {
                $httpProvider.interceptors.push("authorizationInterceptor");
            }
        ]);
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=../../security/services/authorizationInterceptor.js.map
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var app;
(function (app) {
    var security;
    (function (security) {
        "use strict";
        var CurrentUser = (function (_super) {
            __extends(CurrentUser, _super);
            function CurrentUser($rootScope, storage) {
                _super.call(this, $rootScope, storage, "currentUser");
            }
            return CurrentUser;
        })(app.common.SessionStorageProperty);
        angular.module("app.security").service("currentUser", ["$rootScope", "storage", CurrentUser]);
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=../../security/services/currentUser.js.map
var app;
(function (app) {
    var security;
    (function (security) {
        "use strict";
        var LoginRedirectProvider = (function () {
            function LoginRedirectProvider() {
                var _this = this;
                this.loginUrl = "/login";
                this.defaultPath = "/";
                this.setLoginUrl = function (value) {
                    _this.loginUrl = value;
                };
                this.setDefaultUrl = function (value) {
                    _this.defaultPath = value;
                };
                this.$get = ["$q", "$location", function ($q, $location) {
                    return {
                        responseError: function (response) {
                            if (response.status == 401) {
                                _this.lastPath = $location.path();
                                $location.path(_this.loginUrl);
                            }
                            return $q.reject(response);
                        },
                        redirectPreLogin: function () {
                            if (_this.lastPath) {
                                $location.path(_this.lastPath);
                                _this.lastPath = "";
                            }
                            else {
                                $location.path(_this.defaultPath);
                            }
                        }
                    };
                }];
            }
            return LoginRedirectProvider;
        })();
        angular.module("app.security").provider("loginRedirect", [LoginRedirectProvider]).config(["$httpProvider", config]);
        function config($httpProvider) {
            $httpProvider.interceptors.push("loginRedirect");
        }
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=../../security/services/loginRedirectProvider.js.map
var app;
(function (app) {
    var security;
    (function (security) {
        "use strict";
        var SecurityService = (function () {
            function SecurityService($http, $interval, $location, $q, currentUser, formEncode, apiEndpoint, token, tokenExpiryDate) {
                var _this = this;
                this.$http = $http;
                this.$interval = $interval;
                this.$location = $location;
                this.$q = $q;
                this.currentUser = currentUser;
                this.formEncode = formEncode;
                this.apiEndpoint = apiEndpoint;
                this.token = token;
                this.tokenExpiryDate = tokenExpiryDate;
                this.login = function (username, password) {
                    var deferred = _this.$q.defer();
                    var configuration = {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    };
                    var data = _this.formEncode({
                        username: username,
                        password: password,
                        grant_type: "password"
                    });
                    _this.$http.post(_this.apiEndpoint.getBaseUrl("login"), data, configuration).then(function (response) {
                        _this.processToken(username, response).then(function (results) {
                            deferred.resolve(true);
                        });
                    }).catch(function (Error) {
                        deferred.reject();
                    });
                    return deferred.promise;
                };
                this.processToken = function (username, response) {
                    var deferred = _this.$q.defer();
                    _this.token.set({ data: response.data.access_token });
                    _this.tokenExpiryDate.set({ data: Date.now() + response.data.expires_in * 100 });
                    _this.getCurrentUser().then(function (results) {
                        _this.currentUser.set({ data: results });
                        deferred.resolve();
                    });
                    return deferred.promise;
                };
                this.getCurrentUser = function () {
                    var deferred = _this.$q.defer();
                    _this.$http({ method: "GET", url: _this.apiEndpoint.getBaseUrl() + "/identity/getCurrentUser" }).then(function (results) {
                        deferred.resolve(results.data);
                    }).catch(function (error) {
                        deferred.reject(error);
                    });
                    return deferred.promise;
                };
                this.tokenExpired = function () {
                    return Date.now() > _this.tokenExpiryDate.get();
                };
            }
            return SecurityService;
        })();
        security.SecurityService = SecurityService;
        angular.module("app.security").service("securityService", ["$http", "$interval", "$location", "$q", "currentUser", "formEncode", "apiEndpoint", "token", "tokenExpiryDate", SecurityService]);
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=../../security/services/securityService.js.map
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var app;
(function (app) {
    var security;
    (function (security) {
        "use strict";
        var Token = (function (_super) {
            __extends(Token, _super);
            function Token($rootScope, storage) {
                _super.call(this, $rootScope, storage, "token");
            }
            return Token;
        })(app.common.SessionStorageProperty);
        angular.module("app.security").service("token", ["$rootScope", "storage", Token]);
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=../../security/services/token.js.map
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var app;
(function (app) {
    var security;
    (function (security) {
        "use strict";
        var Token = (function (_super) {
            __extends(Token, _super);
            function Token($rootScope, storage) {
                _super.call(this, $rootScope, storage, "tokenExpiryDate");
            }
            return Token;
        })(app.common.SessionStorageProperty);
        angular.module("app.security").service("tokenExpiryDate", ["$rootScope", "storage", Token]);
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=../../security/services/tokenExpiryDate.js.map
var app;
(function (app) {
    var security;
    (function (security) {
        "use strict";
        var User = (function () {
            function User() {
                this.instance = function (data) {
                };
                this.getName = function () {
                };
                this.getCurrent = function () {
                };
            }
            return User;
        })();
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=../../security/services/user.js.map


//# sourceMappingURL=../../userManagement/services/account.js.map


//# sourceMappingURL=../../userManagement/services/profile.js.map
var app;
(function (app) {
    var ui;
    (function (ui) {
        "use strict";
        var AppBar = (function () {
            function AppBar() {
                this.templateUrl = "src/app/ui/appBar/appBar.html";
                this.replace = true;
                this.restrict = "E";
                this.controller = "appBarController";
                this.controllerAs = "appBar";
            }
            AppBar.instance = function () {
                return new AppBar();
            };
            return AppBar;
        })();
        ui.AppBar = AppBar;
        angular.module("app.ui").directive("appBar", [AppBar.instance]);
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));

//# sourceMappingURL=../../ui/appBar/appBar.js.map
var app;
(function (app) {
    var ui;
    (function (ui) {
        "use strict";
        var AppBarController = (function () {
            function AppBarController(appBarService) {
                this.appBarService = appBarService;
            }
            return AppBarController;
        })();
        angular.module("app.ui").controller("appBarController", ["appBarService", AppBarController]);
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));

//# sourceMappingURL=../../ui/appBar/appBarController.js.map
var app;
(function (app) {
    var ui;
    (function (ui) {
        "use strict";
        var AppBarService = (function () {
            function AppBarService($rootScope, historyService, notificationService) {
                var _this = this;
                this.historyService = historyService;
                this.notificationService = notificationService;
                this.getPreviousUrl = function () {
                    return null;
                };
                this.goBack = function () {
                };
                this.hasNotifications = function () {
                    return false;
                };
                this.setButtons = function (buttons) {
                    _this.buttons = buttons;
                };
                this.resetButtons = function () {
                    _this.buttons = null;
                };
                this.getButtons = function () {
                    return _this.buttons;
                };
                this.buttons = [];
                $rootScope.$on("$locationChangeStart", this.resetButtons);
            }
            return AppBarService;
        })();
        ui.AppBarService = AppBarService;
        angular.module("app.ui").service("appBarService", ["$rootScope", "historyService", "notificationService", AppBarService]);
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));

//# sourceMappingURL=../../ui/appBar/appBarService.js.map
var app;
(function (app) {
    var ui;
    (function (ui) {
        var AppHeader = (function () {
            function AppHeader() {
                this.templateUrl = "src/app/ui/appHeader/appHeader.html";
                this.replace = true;
                this.restrict = "E";
                this.controller = "appHeaderController";
                this.controllerAs = "appHeader";
                this.scope = {
                    title: "@",
                    isLoggedIn: "&",
                    getUsername: "&"
                };
            }
            AppHeader.instance = function () {
                return new AppHeader();
            };
            return AppHeader;
        })();
        ui.AppHeader = AppHeader;
        angular.module("app.ui").directive("appHeader", [AppHeader.instance]);
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));

//# sourceMappingURL=../../ui/appHeader/appHeader.js.map
var app;
(function (app) {
    var ui;
    (function (ui) {
        var AppHeaderController = (function () {
            function AppHeaderController() {
            }
            return AppHeaderController;
        })();
        ui.AppHeaderController = AppHeaderController;
        angular.module("app.ui").controller("appHeaderController", [AppHeaderController]);
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));

//# sourceMappingURL=../../ui/appHeader/appHeaderController.js.map
var app;
(function (app) {
    var security;
    (function (security) {
        "use strict";
        var LoginForm = (function () {
            function LoginForm() {
                this.templateUrl = "/src/app/security/directives/loginForm.html";
                this.controllerAs = "loginForm";
                this.controller = "loginFormController";
                this.restrict = "E";
                this.replace = true;
            }
            LoginForm.instance = function () {
                return new LoginForm();
            };
            return LoginForm;
        })();
        angular.module("app.security").directive("loginForm", ["securityService", LoginForm.instance]);
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=../../security/directives/loginForm.js.map
var app;
(function (app) {
    var security;
    (function (security) {
        "use strict";
        var LoginFormController = (function () {
            function LoginFormController($location, loginRedirect, securityService, token) {
                var _this = this;
                this.$location = $location;
                this.loginRedirect = loginRedirect;
                this.securityService = securityService;
                this.token = token;
                this.username = "quinntynebrown@gmail.com";
                this.password = "P@ssw0rd";
                this.tryToLogin = function () {
                    _this.securityService.login(_this.username, _this.password).then(function (results) {
                        _this.loginRedirect.redirectPreLogin();
                    });
                };
            }
            return LoginFormController;
        })();
        angular.module("app.security").controller("loginFormController", ["$location", "loginRedirect", "securityService", LoginFormController]);
    })(security = app.security || (app.security = {}));
})(app || (app = {}));

//# sourceMappingURL=../../security/directives/loginFormController.js.map
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
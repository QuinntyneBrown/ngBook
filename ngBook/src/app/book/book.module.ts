module app.book {

    angular.module("app.book", [
        "ngNewRouter",
        "ngAnimate",
        "app.common",
        "app.security",
        "app.ui"
    ])
        .config([
        "$componentLoaderProvider",
        "$httpProvider",
        "$locationProvider",
        "apiEndpointProvider",
        "featureComponentsMappingsProvider",
        "loginRedirectProvider",
        "routesProvider",
        config
        ]);

    function config($componentLoaderProvider: any,
        $httpProvider: ng.IHttpProvider,
        $locationProvider: ng.ILocationProvider,
        apiEndpointProvider: common.IApiEndpointProvider,
        featureComponentsMappingsProvider: common.IFeatureComponentsMappingsProvider,
        loginRedirectProvider: any,
        routesProvider: common.IRoutesProvider) {

        loginRedirectProvider.setDefaultUrl("/books");

        featureComponentsMappingsProvider.mappings.push(
            {
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
} 
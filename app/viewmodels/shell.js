define(['plugins/router', 'durandal/app'], function (router, app) {
    return {
        router: router,
        search: function () {
            //It's really easy to show a message box.
            //You can add custom options too. Also, it returns a promise for the user's response.
            app.showMessage('Search not yet implemented...');
        },
        activate: function () {
            router.map([
                { hash: '', route: '', title: 'Home', content: '<i class="glyphicon glyphicon-home"></i> <span>Home</span>', moduleId: 'viewmodels/home', nav: true },
                { hash: '#home', title: 'Home', route: 'home(/:type/:id)', moduleId: 'viewmodels/home', nav: false },
                { hash: '#movies', route: 'movies(/:movieid)', title: 'Movies', content: '<i class="glyphicon glyphicon-facetime-video"></i> <span>Movies</span>', moduleId: 'viewmodels/movies', nav: true },
                { hash: '#tvshows', route: 'tvshows(/:show)(/:season)(/:episode)', title: 'TV Shows', content: '<i class="glyphicon glyphicon-film"></i> <span>TV Shows</span>', moduleId: 'viewmodels/tvshows', nav: true }
            ]).buildNavigationModel();

            return router.activate();
        },
        attached: function() {
            visualix.initCarousel();
        }
    };
});
define(['plugins/router'], function (router) {
    var model = {
        searchforterm: ko.observable(),
        searchdatamovies: ko.observableArray(),
        searchdatatvshows: ko.observableArray(),
        searchdataepisodes: ko.observableArray(),
        router: router,
        
        activate: function() {
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
        },
        
        opensearchitem: function(item) {
            model.searchforterm('');

            if (item.type === 'movie') {
                console.log(router.activeItem());
                if (router.activeItem().pagetype === 'Home')
                    router.navigate('#home/movie/' + item.id);
                else
                    router.navigate('#movies/' + item.id);
            }
            if (item.type === 'tvshow') {
                router.navigate('#tvshows/' + item.id);
            }
            if (item.type === 'episode') {
                if (router.activeItem().pagetype === 'Home')
                    router.navigate('#home/episode/' + item.id);
                else
                    router.navigate('#tvshows/' + item.tvshowid + '/' + item.season + '/' + item.id);
            }
        }
    };

    model.searchforterm.subscribe(function () {
        var searchdatamovies = [];
        var searchdatatvshows = [];
        var searchdataepisodes = [];

        if (model.searchforterm().length > 0) {
            var found = 0;
            var regex = new RegExp(model.searchforterm(), "i");
            for (var i = 0; i < xbmc.cache.searchdata.length && found < 25; i++) {
                var item = xbmc.cache.searchdata[i];
                if (item.title.match(regex)) {
                    if (item.type === 'movie')
                        searchdatamovies.push(item);
                    else if (item.type === 'tvshow')
                        searchdatatvshows.push(item);
                    else if (item.type === 'episode')
                        searchdataepisodes.push(item);

                    found++;
                }
            }
        }
        
        model.searchdatamovies(searchdatamovies);
        model.searchdatatvshows(searchdatatvshows);
        model.searchdataepisodes(searchdataepisodes);
    });

    return model;
});
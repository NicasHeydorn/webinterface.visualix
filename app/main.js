requirejs.config({
    paths: {
        'text': '../scripts/text',
        'durandal': '../scripts/durandal',
        'plugins': '../scripts/durandal/plugins',
        'transitions': '../scripts/durandal/transitions'
    }
});

define('jquery', function () { return jQuery; });
define('knockout', ko);
define('xbmc', xbmc);

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'plugins/dialog', 'plugins/router', 'xbmc'], function(system, app, viewLocator, dialog, router, xbmc) {
    //>>excludeStart("build", true);
    system.debug(false);
    //>>excludeEnd("build");

    app.title = 'Visualix';

    app.configurePlugins({
        router: true,
        dialog: true,
        widget: true
    });

    /**
     * Bootstrap modal dialog context.
     */
    dialog.addContext('bootstrap', {
        navigateAfterCloseUrl: null,
        wrapperElement: '.content-wrapper',

        addHost: function(theDialog) {
            var body = $(this.wrapperElement); // The element where the popus is created into.
            $('<div class="modal" id="myModal"></div>').appendTo(body);
            theDialog.host = $('#myModal').get(0);
        },
        removeHost: function() {
            setTimeout(function() {
                $('#myModal').modal('hide');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
            }, 200);
        },
        compositionComplete: function(child, parent, context) {
            var theDialog = dialog.getDialog(context.model);
            $('#myModal').modal('show');
            $('#myModal').on('hidden.bs.modal', function() {
                if (theDialog.context.navigateAfterCloseUrl && theDialog.context.navigateAfterCloseUrl.length > 0 && $(window).width() >= 768)
                    router.navigate(theDialog.context.navigateAfterCloseUrl);
            });
        },
        attached: null
    });

    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell', 'entrance');

        /*
         * Retrieve search data.
         */
        var moviesForSearchRequest = xbmc.getRequestOptions(xbmc.options.moviesForSearch()); // Get the default request options.

        $.when($.ajax(moviesForSearchRequest)).then(function (moviesForSearchResult) {
            for (var i = 0; i < moviesForSearchResult.result.movies.length; i++) {
                xbmc.cache.searchdata.push({
                    type: 'movie',
                    id: moviesForSearchResult.result.movies[i].movieid,
                    title: moviesForSearchResult.result.movies[i].title
                });
            }
        });
        
        var episodesForSearchRequest = xbmc.getRequestOptions(xbmc.options.episodesForSearch()); // Get the default request options.

        $.when($.ajax(episodesForSearchRequest)).then(function (episodesForSearchResult) {
            for (var i = 0; i < episodesForSearchResult.result.episodes.length; i++) {
                xbmc.cache.searchdata.push({
                    type: 'episode',
                    id: episodesForSearchResult.result.episodes[i].episodeid,
                    tvshowid: episodesForSearchResult.result.episodes[i].tvshowid,
                    season: episodesForSearchResult.result.episodes[i].season,
                    title: episodesForSearchResult.result.episodes[i].label
                });
            }
        });

        var tvshowsForSearchRequest = xbmc.getRequestOptions(xbmc.options.tvshowsForSearch()); // Get the default request options.

        $.when($.ajax(tvshowsForSearchRequest)).then(function (tvshowsForSearchResult) {
            for (var i = 0; i < tvshowsForSearchResult.result.tvshows.length; i++) {
                xbmc.cache.searchdata.push({
                    type: 'tvshow',
                    id: tvshowsForSearchResult.result.tvshows[i].tvshowid,
                    title: tvshowsForSearchResult.result.tvshows[i].title
                });
            }
        });
    });
});
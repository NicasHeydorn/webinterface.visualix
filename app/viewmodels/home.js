define(['plugins/router', 'durandal/app', 'knockout', 'plugins/dialog', 'viewmodels/movie-dialog', 'viewmodels/episode-dialog'], function (router, app, ko, dialog, movieDialog, episodeDialog) {
    var infoDialog = null;
    var objectToShow = null;

    var fetchedMovies = {}; // Stores retrieved movies so that request only has to happen once per movie.
    var fetchedEpisodes = {}; // Stores retrieved episodes so that request only has to happen once per episode.
    
    var model = {
        currentid: ko.observable(null),
        movies: ko.observableArray(),
        episodes: ko.observableArray(),

        openMovieDetails: function (movie) {
            router.navigate('#home/movie/' + movie.movieid);
        },

        openEpisodeDetails: function (episode) {
            router.navigate('#home/episode/' + episode.episodeid);
        },

        bindingComplete: function () {
            if (infoDialog && objectToShow)
                dialog.show(infoDialog, objectToShow, 'bootstrap');
        },

        activate: function (type, id) {
            /*
             * If no id is found in the requested route, then:
             *      - Close all open dialogs
             */
            if (!id) {
                model.currentid(null);

                // Close any current movie dialogs.
                if (window.currentInfoDialog) {
                    var current = dialog.getDialog(window.currentInfoDialog);
                    if (current)
                        current.close();

                    window.currentInfoDialog = null;
                }

                return;
            }

            /*
             * Else:
             *      - Set the 'current' id
             *      - Create a new dialog instance
             *      - Get the movie/episode details of the current id and type
             *      - Open the dialog
             */

            model.currentid(id);

            var dialogContext = dialog.getContext('bootstrap');
            dialogContext.navigateAfterCloseUrl = '#home';

            if (type === 'movie') {
                infoDialog = new movieDialog();
                window.currentInfoDialog = infoDialog;
                /*
                 * If the current movie exists in the collection of previously fetched movies:
                 *      - Load the movie from the 'cache'
                 * Else:
                 *      - Get the movie details from the server
                 *
                 * Then:
                 *      - Open the dialog
                 */
                if (fetchedMovies[id]) {
                    objectToShow = fetchedMovies[id];

                    if ($(dialogContext.wrapperElement).length > 0) {
                        dialog.show(infoDialog, objectToShow, 'bootstrap');
                        infoDialog = objectToShow = null;
                    }
                } else {
                    var movieDetailsRequest = xbmc.getRequestOptions(xbmc.options.movieDetails(parseInt(id))); // Get the default request options.

                    $.when($.ajax(movieDetailsRequest)).then(function (movieDetailsResponse) {
                        objectToShow = movieDetailsResponse.result.moviedetails;
                        fetchedMovies[id] = objectToShow;

                        if ($(dialogContext.wrapperElement).length > 0) { // When refreshing a page, this will be false. Fallback in this.bindingComplete.
                            dialog.show(infoDialog, objectToShow, 'bootstrap');
                            infoDialog = objectToShow = null;
                        }
                    });
                }
                
            } else if (type === 'episode') {
                infoDialog = new episodeDialog();
                window.currentInfoDialog = infoDialog;
                /*
                 * If the current episode exists in the collection of previously fetched episodes:
                 *      - Load the episode from the 'cache'
                 * Else:
                 *      - Get the episode details from the server
                 *
                 * Then:
                 *      - Open the dialog
                 */
                if (fetchedEpisodes[id]) {
                    objectToShow = fetchedEpisodes[id];

                    if ($(dialogContext.wrapperElement).length > 0) {
                        dialog.show(infoDialog, objectToShow, 'bootstrap');
                        infoDialog = objectToShow = null;
                    }
                } else {
                    var episodeDetailsRequest = xbmc.getRequestOptions(xbmc.options.episodeDetails(parseInt(id))); // Get the default request options.

                    $.when($.ajax(episodeDetailsRequest)).then(function (episodeDetailsResponse) {
                        console.log("BOOOOEEEEE");
                        console.log(episodeDetailsResponse);
                        objectToShow = episodeDetailsResponse.result.episodedetails;
                        fetchedEpisodes[id] = objectToShow;

                        if ($(dialogContext.wrapperElement).length > 0) { // When refreshing a page, this will be false. Fallback in this.bindingComplete.
                            dialog.show(infoDialog, objectToShow, 'bootstrap');
                            infoDialog = objectToShow = null;
                        }
                    });
                }
            }
        }
    };
    
    /*
     * Get recently added movies and add them to the model.
     */
    var recentMoviesRequest = xbmc.getRequestOptions(xbmc.options.recentMovies()); // Get the default request options.
    console.log(recentMoviesRequest);

    $.when($.ajax(recentMoviesRequest)).then(function (recentMoviesResult) {
        ko.utils.arrayPushAll(model.movies, recentMoviesResult.result.movies);
    });

    /*
     * Get recently added episodes and add them to the model.
     */
    var recentEpisodesRequest = xbmc.getRequestOptions(xbmc.options.recentEpisodes()); // Get the default request options.

    $.when($.ajax(recentEpisodesRequest)).then(function (recentEpisodesResult) {
        ko.utils.arrayPushAll(model.episodes, recentEpisodesResult.result.episodes);
    });

    return model;
});
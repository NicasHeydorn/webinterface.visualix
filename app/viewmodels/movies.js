define(['plugins/router', 'durandal/app', 'knockout', 'plugins/dialog', 'viewmodels/movie-dialog', 'xbmc'], function (router, app, ko, dialog, movieDialog, xbmc) {
    var infoDialog = null;
    var objectToShow = null;

    var model = {
        pagetype: 'Movies',
        movies: ko.observableArray(),
        movieid: ko.observable(null),

        openDetails: function (movie) {
            router.navigate('#movies/' + movie.movieid);
        },

        bindingComplete: function() {
            if (infoDialog && objectToShow) {
                dialog.show(infoDialog, objectToShow, 'bootstrap');
            }
        },
        
        activate: function (movieid) {
            /*
             * If no movieid is found in the requested route, then:
             *      - Close all open dialogs
             */
            if (!movieid) {
                model.movieid(null);

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
             *      - Set the 'current' movie id
             *      - Create a new dialog instance
             *      - Open the dialog
             */
            model.movieid(movieid);

            var dialogContext = dialog.getContext('bootstrap');
            dialogContext.navigateAfterCloseUrl = '#movies';

            infoDialog = new movieDialog();
            objectToShow = { movieid: movieid };

            window.currentInfoDialog = infoDialog;

            if ($(dialogContext.wrapperElement).length > 0) {
                dialog.show(infoDialog, objectToShow, 'bootstrap');
                infoDialog = objectToShow = null;
            }
        }
    };

    /*
     * Get all movies and add them to the model.
     */
    var moviesPerRequest = 25;

    var getLimitedMovies = function (start, end) {
        var allMoviesRequest = xbmc.getRequestOptions(xbmc.options.allMoviesWithLimit(start, end)); // Get the default request options.

        $.when($.ajax(allMoviesRequest)).then(function (allMoviesResult) {
            ko.utils.arrayPushAll(model.movies, allMoviesResult.result.movies);

            xbmc.cache.allmovies.push(allMoviesResult.result.movies);
            
            if (allMoviesResult.result.limits.total > end) {
                getLimitedMovies(start + moviesPerRequest, end + moviesPerRequest);
            }
        });
    };

    getLimitedMovies(0, moviesPerRequest);
    
    return model;
});
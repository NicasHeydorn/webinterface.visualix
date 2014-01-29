define(['plugins/router', 'durandal/app', 'knockout', 'plugins/dialog', 'viewmodels/movie-dialog', 'xbmc'], function (router, app, ko, dialog, movieDialog, xbmc) {
    var infoDialog = null;
    var objectToShow = null;

    var fetchedMovies = {}; // Stores retrieved objects so that request only has to happen once per movie.

    var model = {
        movies: ko.observableArray(),
        movieid: ko.observable(null),

        openDetails: function (movie) {
            router.navigate('#movies/' + movie.movieid);
        },

        bindingComplete: function () {
            if (infoDialog && objectToShow)
                dialog.show(infoDialog, objectToShow, 'bootstrap');
        },
        
        activate: function(movieid) {
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
             *      - Get the movie details of the current movie id
             *      - Open the dialog
             */
            model.movieid(movieid);

            var dialogContext = dialog.getContext('bootstrap');
            dialogContext.navigateAfterCloseUrl = '#movies';

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
            if (fetchedMovies[movieid]) {
                objectToShow = fetchedMovies[movieid];

                if ($(dialogContext.wrapperElement).length > 0) {
                    dialog.show(infoDialog, objectToShow, 'bootstrap');
                    infoDialog = objectToShow = null;
                }
            } else {
                var movieDetailsRequest = xbmc.getRequestOptions(xbmc.options.movieDetails(parseInt(movieid))); // Get the default request options.
                
                $.when($.ajax(movieDetailsRequest)).then(function(movieDetailsResponse) {
                    objectToShow = movieDetailsResponse.result.moviedetails;
                    fetchedMovies[movieid] = objectToShow;

                    if ($(dialogContext.wrapperElement).length > 0) { // When refreshing a page, this will be false. Fallback in this.bindingComplete.
                        dialog.show(infoDialog, objectToShow, 'bootstrap');
                        infoDialog = objectToShow = null;
                    }
                });
            }
        }
    };

    /*
     * Get all movies and add them to the model.
     */
    var allMoviesRequest = xbmc.getRequestOptions(xbmc.options.allMovies()); // Get the default request options.

    $.when($.ajax(allMoviesRequest)).then(function (allMoviesResult) {
        ko.utils.arrayPushAll(model.movies, allMoviesResult.result.movies);
    });

    return model;
});
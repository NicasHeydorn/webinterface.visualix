define(['plugins/router', 'durandal/app', 'knockout', 'plugins/dialog'], function (router, app, ko, dialog) {
    var model = {
        movies: ko.observableArray(),
        movieid: ko.observable(null),

        openDetails: function (movie) {
            router.navigate('#movies/' + movie.movieid);
        },
        
        activate: function (movieid) {
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

            model.movieid(movieid);
            
            var infoDialog = new dialog.MessageBox();
            window.currentInfoDialog = infoDialog;
            
            dialog.show(infoDialog, [movieid, "titel", {}], 'infoDialog');

        }
    };

    var movies = [
        {
            movieid: 1,
            title: 'The 40 Year Old Virgin',
            poster: 'images/posters/40-year-old-virgin-poster1.jpg',
            isWatched: false
        },
        {
            movieid: 2,
            title: 'The 40 Year Old Virgin',
            poster: 'images/posters/40-year-old-virgin-poster1.jpg',
            isWatched: true
        }
    ];

    ko.utils.arrayPushAll(model.movies, movies);
    window.movies = movies;

    return model;
});
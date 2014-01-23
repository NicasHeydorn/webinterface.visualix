define(['plugins/router', 'durandal/app', 'knockout', 'plugins/dialog', 'viewmodels/movie-dialog'], function (router, app, ko, dialog, movieDialog) {
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
            
            // Retrieve the movie object.
            var movie = {
                movieid: movieid,
                title: 'The 40 Year Old Virgin',
                runtime: 118,
                year: 2009,
                isWatched: true,
                fanart: 'images/40yov.jpg',
                plot: 'Andy Stitzer has a pleasant life with a nice apartment and a job stamping invoices at an electronics store. But at age 40, there\'s one thing Andy hasn\'t done, and it\'s really bothering his sex-obsessed male co-workers: Andy is still a virgin. Determined to help Andy get laid, the guys make it their mission to de-virginize him. But it all seems hopeless until Andy meets small business owner Trish, a single mom.'
            };
            
            var infoDialog = new movieDialog();
            window.currentInfoDialog = infoDialog;

            dialog.getContext('bootstrap').navigateAfterCloseUrl = '#movies';
            dialog.show(infoDialog, movie, 'bootstrap');
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

    return model;
});
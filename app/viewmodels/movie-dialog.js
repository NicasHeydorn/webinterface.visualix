define(['xbmc', 'knockout'], function (xbmc, ko) {
    var MovieDialog = function() {
        this.movie = ko.observable({
            art: {},
            cast: [],
            director: [],
            writer: [],
            genre: []
        });
        this.playMovie = function () {
            var playMovieRequest = xbmc.getRequestOptions(xbmc.options.playFile(this.movie().file)); // Get the default request options.

            $.ajax(playMovieRequest);
        };
    };

    MovieDialog.prototype.selectOption = function(dialogResult) {
        dialog.close(this, dialogResult);
    };

    MovieDialog.prototype.activate = function (data) {
        /*
         * Make sure the movieid is received as integer.
         */
        if (typeof data.movieid === 'string')
            data.movieid = parseInt(data.movieid);
        
        /*
         * If the current movie exists in the collection of previously fetched movies:
         *      - Load the movie from the 'cache'
         * Else:
         *      - Get the movie details from the server
         *
         * Then:
         *      - Open the dialog
         */
        var model = this;

        if (xbmc.cache.movies[data.movieid]) {
            model.movie(xbmc.cache.movies[data.movieid]);
        } else {
            var movieDetailsRequest = xbmc.getRequestOptions(xbmc.options.movieDetails(data.movieid)); // Get the default request options.

            $.when($.ajax(movieDetailsRequest)).then(function (movieDetailsResponse) {
                var moviedetails = movieDetailsResponse.result.moviedetails;
                
                model.movie(moviedetails); // Set the details in the model.
                xbmc.cache.movies[data.movieid] = moviedetails; // Save the retrieved data to the cache.
            });
        }
    };

    return MovieDialog;
});
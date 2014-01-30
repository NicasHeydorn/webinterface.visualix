define(['xbmc', 'knockout', 'plugins/router'], function (xbmc, ko, router) {
    var TVShowDialog = function () {
        this.tvshow = ko.observable({
            art: {},
            cast: [],
            director: [],
            writer: [],
            genre: [],
            seasons: []
        });
        this.isWatched = function () {
            var watched = true;
            for (var i = 0; i < this.tvshow().seasons.length; i++) {
                var current = this.tvshow().seasons[i];
                if (current.watchedepisodes < current.episode) {
                    watched = false;
                    break;
                }
            }
            return watched;
        };
    };

    TVShowDialog.prototype.selectOption = function (dialogResult) {
        dialog.close(this, dialogResult);
    };

    TVShowDialog.prototype.activate = function (data) {
        /*
         * Make sure the tvshowid is received as integer.
         */
        if (typeof data.tvshowid === 'string')
            data.tvshowid = parseInt(data.tvshowid);

        /*
         * Bind functions to the model functions
         */
        this.showSeasonDetails = function (season) {
            router.navigate('#tvshows/' + data.tvshowid + '/' + season.season);
        };

        /*
         * If the current tvshow exists in the collection of previously fetched tvshows:
         *      - Load the tvshow from the 'cache'
         * Else:
         *      - Get the tvshow details from the server
         *
         * Then:
         *      - Open the dialog
         */
        var model = this;

        if (xbmc.cache.tvshows[data.tvshowid]) {
            var tvshow = xbmc.cache.tvshows[data.tvshowid];

            model.tvshow(tvshow);
        } else {
            var tvshowDetailsRequest = xbmc.getRequestOptions(xbmc.options.tvshowDetails(data.tvshowid)); // Get the default request options.

            $.when($.ajax(tvshowDetailsRequest)).then(function (tvshowDetailsResponse) {
                var tvshowdetails = tvshowDetailsResponse.result.tvshowdetails;
                
                var seasonDetailsRequest = xbmc.getRequestOptions(xbmc.options.seasonDetails(data.tvshowid)); // Get the default request options.

                $.when($.ajax(seasonDetailsRequest)).then(function (seasonDetailsResponse) {
                    tvshowdetails.seasons = seasonDetailsResponse.result.seasons; // Add the season data to the tvshow info.

                    /*
                     * Bind the received data to the model.
                     */
                    model.tvshow(tvshowdetails); // Set the details in the model.
                    xbmc.cache.tvshows[data.tvshowid] = tvshowdetails; // Save the retrieved data to the cache.
                });
            });
        }
    };

    return TVShowDialog;
});
define(['xbmc', 'knockout', 'plugins/router'], function (xbmc, ko, router) {
    var SeasonDialog = function () {
        this.season = ko.observable({});
        this.tvshow = ko.observable({
            art: {},
            cast: [],
            director: [],
            writer: [],
            genre: [],
            seasons: [],
            isWatched: function() {
            }
        });
        this.episodes = ko.observableArray();
    };

    SeasonDialog.prototype.selectOption = function (dialogResult) {
        dialog.close(this, dialogResult);
    };

    SeasonDialog.prototype.activate = function (data) {
        /*
         * Make sure the seasonid and tvshowid are received as integer.
         */
        if (typeof data.seasonid === 'string')
            data.seasonid = parseInt(data.seasonid);
        if (typeof data.tvshowid === 'string')
            data.tvshowid = parseInt(data.tvshowid);
        
        /*
         * Bind functions to the model functions
         */
        this.backToTVShow = function () {
            router.navigate('#tvshows/' + data.tvshowid);
        };
        
        this.showEpisodeDetails = function (episode) {
            router.navigate('#tvshows/' + data.tvshowid + '/' + data.seasonid + '/' + episode.episodeid);
        };

        /*
         * If the current season exists in the collection of previously fetched seasons:
         *      - Load the season from the 'cache'
         * Else:
         *      - Get the season details from the server
         *
         * Then:
         *      - Open the dialog
         */
        var model = this;

        if (xbmc.cache.tvshows[data.tvshowid]) {
            var tvshow = xbmc.cache.tvshows[data.tvshowid];

            model.tvshow(tvshow);
            model.season(getSeason(tvshow, data.seasonid));
        } else {
            var tvshowDetailsRequest = xbmc.getRequestOptions(xbmc.options.tvshowDetails(data.tvshowid)); // Get the default request options.

            $.when($.ajax(tvshowDetailsRequest)).then(function (tvshowDetailsResponse) {
                var tvshowdetails = tvshowDetailsResponse.result.tvshowdetails;

                var seasonDetailsRequest = xbmc.getRequestOptions(xbmc.options.seasonDetails(data.tvshowid)); // Get the default request options.

                $.when($.ajax(seasonDetailsRequest)).then(function (seasonDetailsResponse) {
                    tvshowdetails.seasons = seasonDetailsResponse.result.seasons; // Add the season data to the tvshow info.

                    /*
                     * Add additional functions to the model.
                     */
                    tvshowdetails.isWatched = (function () {
                        var watched = true;
                        for (var i = 0; i < model.tvshow().seasons.length; i++) {
                            var current = model.tvshow().seasons[i];

                            if (current.watchedepisodes < current.episode) {
                                watched = false;
                                break;
                            }
                        }
                        return watched;
                    })();

                    /*
                     * Bind the received data to the model.
                     */
                    model.tvshow(tvshowdetails); // Set the tvshow details in the model.
                    model.season(getSeason(tvshowdetails, data.seasonid)); // Set the season details in the model.
                    xbmc.cache.tvshows[data.tvshowid] = tvshowdetails; // Save the retrieved data to the cache.
                });
            });
        }
        
        /*
         * If the current season exists in the collection of previously fetched seasons:
         *      - Load the season from the 'cache'
         * Else:
         *      - Get the season details from the server
         *
         * Then:
         *      - Open the dialog
         */
        if (xbmc.cache.seasons[data.tvshowid + ':' + data.seasonid]) {
            model.episodes(xbmc.cache.seasons[data.tvshowid + ':' + data.seasonid]);
        } else {
            var seasonEpisodesDetailsRequest = xbmc.getRequestOptions(xbmc.options.seasonEpisodesDetails(data.tvshowid, data.seasonid)); // Get the default request options.

            $.when($.ajax(seasonEpisodesDetailsRequest)).then(function (seasonEpisodesDetailsResponse) {
                var episodes = seasonEpisodesDetailsResponse.result.episodes;

                model.episodes(episodes); // Set the details in the model.
                xbmc.cache.seasons[data.tvshowid + ':' + data.seasonid] = episodes; // Save the retrieved data to the cache.
            });
        }
    };

    var getSeason = function(tvshow, seasonid) {
        var result = null;
        for (var i = 0; i < tvshow.seasons.length; i++) {
            var current = tvshow.seasons[i];
            if (current.season === seasonid) {
                result = current;
                break;
            }
        }
        return result;
    };

    return SeasonDialog;
});
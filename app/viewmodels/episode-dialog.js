define(['plugins/router'], function (router) {
    var EpisodeDialog = function () {
        this.episode = ko.observable({
            art: {},
            cast: [],
            writer: [],
            director: [],
            genre: []
        });
        this.backToSeason = function () {
            router.navigate('#tvshows/' + this.episode().tvshowid + '/' + this.episode().season);
        };
        this.playEpisode = function () {
            var playEpisodeRequest = xbmc.getRequestOptions(xbmc.options.playFile(this.episode().file)); // Get the default request options.

            $.ajax(playEpisodeRequest);
        };
    };

    EpisodeDialog.prototype.selectOption = function (dialogResult) {
        dialog.close(this, dialogResult);
    };

    EpisodeDialog.prototype.activate = function (data) {
        /*
         * Make sure the episodeid is received as integer.
         */
        if (typeof data.episodeid === 'string')
            data.episodeid = parseInt(data.episodeid);

        /*
         * If the current episode exists in the collection of previously fetched episodes:
         *      - Load the episode from the 'cache'
         * Else:
         *      - Get the episode details from the server
         *
         * Then:
         *      - Open the dialog
         */
        var model = this;

        if (xbmc.cache.episodes[data.episodeid]) {
            var episode = xbmc.cache.episodes[data.episodeid];
            model.episode(episode);
        } else {
            var episodeDetailsRequest = xbmc.getRequestOptions(xbmc.options.episodeDetails(data.episodeid)); // Get the default request options.

            $.when($.ajax(episodeDetailsRequest)).then(function (episodeDetailsResponse) {
                var episodedetails = episodeDetailsResponse.result.episodedetails;
                
                /*
                 * Bind the received data to the model.
                 */
                model.episode(episodedetails); // Set the details in the model.
                xbmc.cache.episodes[data.episodeid] = episodedetails; // Save the retrieved data to the cache.
            });
        }

        /*
         * Hide the 'back' button when the episode is loaded from the homepage.
         */
        model.hidebackbutton = router.activeItem().isdefault;
    };

    return EpisodeDialog;
});
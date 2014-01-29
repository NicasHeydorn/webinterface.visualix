define(['plugins/router'], function (router) {
    var EpisodeDialog = function () {
        this.episode = ko.observable({
            art: {},
            cast: [],
            writer: [],
            director: [],
            genre: []
        });
        this.backToSeason = function() {
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
            model.episode(xbmc.cache.episodes[data.episodeid]);
        } else {
            var episodeDetailsRequest = xbmc.getRequestOptions(xbmc.options.episodeDetails(data.episodeid)); // Get the default request options.

            $.when($.ajax(episodeDetailsRequest)).then(function (episodeDetailsResponse) {
                var episodedetails = episodeDetailsResponse.result.episodedetails;
                
                /*
                 * Hide the 'back' button when the episode is loaded from the homepage.
                 */
                if (router.activeItem().isdefault) {
                    episodedetails.tvshowid = null;
                }

                /*
                 * Add additional functions to the model.
                 */
                model.backToSeason = function () {
                    router.navigate('#tvshows/' + episodedetails.tvshowid + '/' + episodedetails.season);
                };

                /*
                 * Bind the received data to the model.
                 */
                model.episode(episodedetails); // Set the details in the model.
                xbmc.cache.episodes[data.episodeid] = episodedetails; // Save the retrieved data to the cache.
            });
        }
    };

    return EpisodeDialog;
});
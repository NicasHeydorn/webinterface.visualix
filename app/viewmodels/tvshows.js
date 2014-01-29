define(['plugins/router', 'durandal/app', 'knockout', 'plugins/dialog', 'viewmodels/tvshow-dialog', 'viewmodels/season-dialog', 'viewmodels/episode-dialog'], function (router, app, ko, dialog, tvshowDialog, seasonDialog, episodeDialog) {
    var infoDialog = null;
    var objectToShow = null;

    var fetchedTVShows = {}; // Stores retrieved objects so that request only has to happen once per tvshow.
    var fetchedSeasons = {}; // Stores retrieved objects so that request only has to happen once per season.
    var fetchedEpisodes = {}; // Stores retrieved objects so that request only has to happen once per episode.

    var model = {
        tvshows: ko.observableArray(),
        tvshowid: ko.observable(null),
        seasonid: ko.observable(null),

        openTvShowDetails: function (tvshow) {
            router.navigate('#tvshows/' + tvshow.tvshowid);
        },

        bindingComplete: function () {
            if (infoDialog && objectToShow)
                dialog.show(infoDialog, objectToShow, 'bootstrap');
        },

        activate: function (tvshowid, seasonid, episodeid) {
            /*
             * If no tvshowid is found in the requested route, then:
             *      - Close all open dialogs
             */
            if (!tvshowid) {
                model.tvshowid(null);

                // Close any current dialogs.
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
             *      - Set the 'current' tvshow, season and episode id
             *      - Create a new dialog instance
             *      - Get the details of the requested item
             *      - Open the dialog
             */

            model.tvshowid(tvshowid);

            var dialogContext = dialog.getContext('bootstrap');
            dialogContext.navigateAfterCloseUrl = '#tvshows';

            if (seasonid) {
                model.seasonid(seasonid);

                if (episodeid) { // Load episode data
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
                    if (fetchedEpisodes[episodeid]) {
                        objectToShow = fetchedEpisodes[episodeid];

                        if ($(dialogContext.wrapperElement).length > 0) {
                            dialog.show(infoDialog, objectToShow, 'bootstrap');
                            infoDialog = objectToShow = null;
                        }
                    } else {
                        var episodeDetailsRequest = xbmc.getRequestOptions(xbmc.options.episodeDetails(parseInt(episodeid))); // Get the default request options.

                        $.when($.ajax(episodeDetailsRequest)).then(function (episodeDetailsResponse) {
                            objectToShow = episodeDetailsResponse.result.episodedetails;
                            fetchedEpisodes[episodeid] = objectToShow;

                            if ($(dialogContext.wrapperElement).length > 0) { // When refreshing a page, this will be false. Fallback in this.bindingComplete.
                                dialog.show(infoDialog, objectToShow, 'bootstrap');
                                infoDialog = objectToShow = null;
                            }
                        });
                    }
                } else { // Load season data
                    infoDialog = new seasonDialog();
                    window.currentInfoDialog = infoDialog;
                    /*
                     * If the current season exists in the collection of previously fetched seasons:
                     *      - Load the season from the 'cache'
                     * Else:
                     *      - Get the season details from the server
                     *
                     * Then:
                     *      - Open the dialog
                     */
                    if (fetchedSeasons[tvshowid + "-" + seasonid]) {
                        objectToShow = fetchedSeasons[tvshowid + "-" + seasonid];

                        if ($(dialogContext.wrapperElement).length > 0) {
                            dialog.show(infoDialog, objectToShow, 'bootstrap');
                            infoDialog = objectToShow = null;
                        }
                    } else {
                        var seasonEpisodesDetailsRequest = xbmc.getRequestOptions(xbmc.options.seasonEpisodesDetails(parseInt(tvshowid), parseInt(seasonid))); // Get the default request options.

                        $.when($.ajax(seasonEpisodesDetailsRequest)).then(function (seasonEpisodesDetailsResponse) {
                            var allInfo = fetchedTVShows[tvshowid].seasons;
                            for (var i = 0; i < allInfo.length; i++) {
                                var currentInfo = allInfo[i];
                                if (parseInt(currentInfo.season) === parseInt(seasonid)) {
                                    allInfo = currentInfo;
                                    break;
                                }
                            }
                            objectToShow = {
                                tvshow: fetchedTVShows[tvshowid],
                                season: allInfo,
                                episodes: seasonEpisodesDetailsResponse.result.episodes
                            };
                            fetchedSeasons[tvshowid + "-" + seasonid] = objectToShow;
                            console.log(objectToShow);

                            if ($(dialogContext.wrapperElement).length > 0) { // When refreshing a page, this will be false. Fallback in this.bindingComplete.
                                dialog.show(infoDialog, objectToShow, 'bootstrap');
                                infoDialog = objectToShow = null;
                            }
                        });
                    }
                }

            } else { // Load tvshow data
                infoDialog = new tvshowDialog();
                window.currentInfoDialog = infoDialog;
                /*
                 * If the current tvshow exists in the collection of previously fetched tvshows:
                 *      - Load the tvshow from the 'cache'
                 * Else:
                 *      - Get the tvshow details from the server
                 *
                 * Then:
                 *      - Open the dialog
                 */
                if (fetchedTVShows[tvshowid]) {
                    objectToShow = fetchedTVShows[tvshowid];

                    if ($(dialogContext.wrapperElement).length > 0) {
                        dialog.show(infoDialog, objectToShow, 'bootstrap');
                        infoDialog = objectToShow = null;
                    }
                } else {
                    var tvshowDetailsRequest = xbmc.getRequestOptions(xbmc.options.tvshowDetails(parseInt(tvshowid))); // Get the default request options.

                    $.when($.ajax(tvshowDetailsRequest)).then(function (tvshowDetailsResponse) {
                        var seasonDetailsRequest = xbmc.getRequestOptions(xbmc.options.seasonDetails(parseInt(tvshowid))); // Get the default request options.
                        
                        $.when($.ajax(seasonDetailsRequest)).then(function(seasonDetailsResponse) {
                            objectToShow = {
                                details: tvshowDetailsResponse.result.tvshowdetails,
                                seasons: seasonDetailsResponse.result.seasons
                            };
                            fetchedTVShows[tvshowid] = objectToShow;

                            if ($(dialogContext.wrapperElement).length > 0) { // When refreshing a page, this will be false. Fallback in this.bindingComplete.
                                dialog.show(infoDialog, objectToShow, 'bootstrap');
                                infoDialog = objectToShow = null;
                            }
                        });
                    });
                }
            }
        }
    };

    var tvshows = [
        {
            tvshowid: 1,
            title: '1x01 &bull; Pilot',
            poster: 'images/posters/big_bang_theory_xlg.jpg',
            isWatched: true
        },
        {
            tvshowid: 2,
            title: '1x02 &bull; The Big Bran Hypothesis',
            poster: 'images/posters/big_bang_theory_xlg.jpg',
            isWatched: false
        },
        {
            tvshowid: 3,
            title: '2x10 &bull; There\'s Something About Harry',
            poster: 'images/posters/dexter_poster.jpg',
            isWatched: false
        }
    ];

    ko.utils.arrayPushAll(model.tvshows, tvshows);

    return model;
});
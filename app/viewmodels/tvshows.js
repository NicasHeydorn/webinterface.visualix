define(['plugins/router', 'durandal/app', 'knockout', 'plugins/dialog', 'viewmodels/tvshow-dialog', 'viewmodels/season-dialog', 'viewmodels/episode-dialog', 'xbmc'], function (router, app, ko, dialog, tvshowDialog, seasonDialog, episodeDialog, xbmc) {
    var infoDialog = null;
    var objectToShow = null;

    var model = {
        tvshows: ko.observableArray(),
        tvshowid: ko.observable(null),

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
             *      - Set the 'current' id to the relevated data
             *      - Create a new dialog instance
             *      - Open the dialog
             */
            model.tvshowid(tvshowid);

            var dialogContext = dialog.getContext('bootstrap');
            dialogContext.navigateAfterCloseUrl = '#tvshows';

            if (seasonid) {
                if (episodeid) {
                    infoDialog = new episodeDialog();
                    objectToShow = { episodeid: episodeid, seasonid: seasonid, tvshowid: tvshowid };
                }
                else {
                    infoDialog = new seasonDialog();
                    objectToShow = { seasonid: seasonid, tvshowid: tvshowid };
                }
            } else {
                infoDialog = new tvshowDialog();
                objectToShow = { tvshowid: tvshowid };
            }
            
            window.currentInfoDialog = infoDialog;

            if ($(dialogContext.wrapperElement).length > 0) {
                dialog.show(infoDialog, objectToShow, 'bootstrap');
                infoDialog = objectToShow = null;
            }
        }
    };

    /*
     * Get all tvshows and add them to the model.
     */
    var allTVShowsRequest = xbmc.getRequestOptions(xbmc.options.allTVShows()); // Get the default request options.

    $.when($.ajax(allTVShowsRequest)).then(function (allTVShowsResult) {
        ko.utils.arrayPushAll(model.tvshows, allTVShowsResult.result.tvshows);
    });

    return model;
});
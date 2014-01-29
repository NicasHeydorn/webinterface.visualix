define(['plugins/router'], function (router) {
    var TVShowDialog = function() {
    };

    TVShowDialog.prototype.selectOption = function (dialogResult) {
        dialog.close(this, dialogResult);
    };

    TVShowDialog.prototype.activate = function (tvshow) {
        this.showSeasonDetails = function (season) {
            router.navigate('#tvshows/' + tvshow.details.tvshowid + '/' + season.season);
        };

        tvshow.details.isWatched = (function() {
            var watched = true;
            for (var i = 0; i < tvshow.seasons.length; i++) {
                var current = tvshow.seasons[i];

                if (current.watchedepisodes < current.episode) {
                    watched = false;
                    break;
                }
            }
            return watched;
        })();
        
        this.tvshow = tvshow;
    };

    return TVShowDialog;
});
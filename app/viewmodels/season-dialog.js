define(['plugins/router'], function (router) {
    var SeasonDialog = function(message, title, options) {
        this.message = message;
        this.title = title || SeasonDialog.defaultTitle;
        this.options = options || SeasonDialog.defaultOptions;
    };

    SeasonDialog.prototype.selectOption = function (dialogResult) {
        dialog.close(this, dialogResult);
    };

    SeasonDialog.prototype.activate = function (season) {
        this.showEpisodeDetails = function (episode) {
            router.navigate('#tvshows/' + season.seasondetails.tvshowid + '/' + season.seasondetails.seasonid + '/' + episode.episodeid);
        };
        
        this.backToTVShow = function () {
            router.navigate('#tvshows/' + season.season.tvshowid);
        };

        this.season = season;
    };

    return SeasonDialog;
});
define(['plugins/router'], function (router) {
    var EpisodeDialog = function (message, title, options) {
        this.message = message;
        this.title = title || EpisodeDialog.defaultTitle;
        this.options = options || EpisodeDialog.defaultOptions;
    };

    EpisodeDialog.prototype.selectOption = function (dialogResult) {
        dialog.close(this, dialogResult);
    };

    EpisodeDialog.prototype.activate = function (episode) {
        this.backToSeason = function () {
            router.navigate('#tvshows/' + episode.tvshowid + '/' + episode.seasonid);
        };

        this.episode = episode;
    };

    return EpisodeDialog;
});
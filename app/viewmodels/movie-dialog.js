define(function() {
    var MovieDialog = function(message, title, options) {
        this.message = message;
        this.title = title || MovieDialog.defaultTitle;
        this.options = options || MovieDialog.defaultOptions;
    };

    MovieDialog.prototype.selectOption = function(dialogResult) {
        dialog.close(this, dialogResult);
    };

    MovieDialog.prototype.activate = function (movie) {
        this.movie = movie;
    };

    return MovieDialog;
});
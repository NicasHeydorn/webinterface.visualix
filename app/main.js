requirejs.config({
    paths: {
        'text': '../scripts/text',
        'durandal': '../scripts/durandal',
        'plugins': '../scripts/durandal/plugins',
        'transitions': '../scripts/durandal/transitions'
    }
});

define('jquery', function () { return jQuery; });
define('knockout', ko);

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'plugins/dialog', 'plugins/router'], function (system, app, viewLocator, dialog, router) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    app.title = 'Visualix';

    app.configurePlugins({
        router: true,
        dialog: true,
        widget: true
    });
    
    /**
     * Bootstrap modal dialog context.
     */
    dialog.addContext('bootstrap', {
        navigateAfterCloseUrl: null,
        
        addHost: function (theDialog) {
            var body = $('body');
            $('<div class="modal" id="myModal"></div>').appendTo(body);
            theDialog.host = $('#myModal').get(0);
        },
        removeHost: function (theDialog) {
            var that = this;
            setTimeout(function () {
                $('#myModal').modal('hide');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
            }, 200);
        },
        compositionComplete: function (child, parent, context) {
            var theContext = context.model.__dialog__.context;
            var theDialog = dialog.getDialog(context.model);
            $('#myModal').modal('show');
            $('#myModal').on('hidden.bs.modal', function (e) {
                if (theContext.navigateAfterCloseUrl && theContext.navigateAfterCloseUrl.length > 0 && $(window).width() >= 768)
                    router.navigate(theContext.navigateAfterCloseUrl);
            });
        },
        attached: null
    });

    app.start().then(function () {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell', 'entrance');
    });
});
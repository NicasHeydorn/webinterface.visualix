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
     * @class DialogContext
     */
    dialog.addContext('infoDialog', {
        blockoutOpacity: .2,
        removeDelay: 200,
        /**
         * In this function, you are expected to add a DOM element to the tree which will serve as the "host" for the modal's composed view. You must add a property called host to the modalWindow object which references the dom element. It is this host which is passed to the composition module.
         * @method addHost
         * @param {Dialog} theDialog The dialog model.
         */
        addHost: function (theDialog) {
            var body = $('body');
            var blockout = $('<div class="modalBlockout"></div>')
                .css({ 'z-index': dialog.getNextZIndex(), 'opacity': this.blockoutOpacity })
                .appendTo(body);

            var host = $('<div class="modalHost"></div>')
                .css({ 'z-index': dialog.getNextZIndex() })
                .appendTo(body);

            theDialog.host = host.get(0);
            theDialog.blockout = blockout.get(0);

            if (!dialog.isOpen()) {
                theDialog.oldBodyMarginRight = body.css("margin-right");
                theDialog.oldInlineMarginRight = body.get(0).style.marginRight;

                var html = $("html");
                var oldBodyOuterWidth = body.outerWidth(true);
                var oldScrollTop = html.scrollTop();
                $("html").css("overflow-y", "hidden");
                var newBodyOuterWidth = $("body").outerWidth(true);
                body.css("margin-right", (newBodyOuterWidth - oldBodyOuterWidth + parseInt(theDialog.oldBodyMarginRight, 10)) + "px");
                html.scrollTop(oldScrollTop); // necessary for Firefox
            }
        },
        /**
         * This function is expected to remove any DOM machinery associated with the specified dialog and do any other necessary cleanup.
         * @method removeHost
         * @param {Dialog} theDialog The dialog model.
         */
        removeHost: function (theDialog) {
            $(theDialog.host).css('opacity', 0);
            $(theDialog.blockout).css('opacity', 0);

            setTimeout(function () {
                ko.removeNode(theDialog.host);
                ko.removeNode(theDialog.blockout);
            }, this.removeDelay);

            if (!dialog.isOpen()) {
                var html = $("html");
                var oldScrollTop = html.scrollTop(); // necessary for Firefox.
                html.css("overflow-y", "").scrollTop(oldScrollTop);

                if (theDialog.oldInlineMarginRight) {
                    $("body").css("margin-right", theDialog.oldBodyMarginRight);
                } else {
                    $("body").css("margin-right", '');
                }
            }

            router.navigate('#movies');
        },
        attached: function (view) {
            //To prevent flickering in IE8, we set visibility to hidden first, and later restore it
            $(view).css("visibility", "hidden");
        },
        /**
         * This function is called after the modal is fully composed into the DOM, allowing your implementation to do any final modifications, such as positioning or animation. You can obtain the original dialog object by using `getDialog` on context.model.
         * @method compositionComplete
         * @param {DOMElement} child The dialog view.
         * @param {DOMElement} parent The parent view.
         * @param {object} context The composition context.
         */
        compositionComplete: function (child, parent, context) {
            var theDialog = dialog.getDialog(context.model);
            var $child = $(child);
            var loadables = $child.find("img").filter(function () {
                //Remove images with known width and height
                var $this = $(this);
                return !(this.style.width && this.style.height) && !($this.attr("width") && $this.attr("height"));
            });

            $child.data("predefinedWidth", $child.get(0).style.width);

            var setDialogPosition = function () {
                //Setting a short timeout is need in IE8, otherwise we could do this straight away
                setTimeout(function () {
                    //We will clear and then set width for dialogs without width set 
                    if (!$child.data("predefinedWidth")) {
                        $child.css({ width: '' }); //Reset width
                    }
                    var width = $child.outerWidth(false);
                    var height = $child.outerHeight(false);
                    var windowHeight = $(window).height();
                    var constrainedHeight = Math.min(height, windowHeight);

                    $child.css({
                        'margin-top': (-constrainedHeight / 2).toString() + 'px',
                        'margin-left': (-width / 2).toString() + 'px'
                    });

                    if (!$child.data("predefinedWidth")) {
                        //Ensure the correct width after margin-left has been set
                        $child.outerWidth(width);
                    }

                    if (height > windowHeight) {
                        $child.css("overflow-y", "auto");
                    } else {
                        $child.css("overflow-y", "");
                    }

                    $(theDialog.host).css('opacity', 1);
                    $child.css("visibility", "visible");

                    $child.find('.autofocus').first().focus();
                }, 1);
            };

            setDialogPosition();
            loadables.load(setDialogPosition);

            if ($child.hasClass('autoclose')) {
                $(theDialog.blockout).click(function () {
                    theDialog.close();
                });
            }
        }
    });

    app.start().then(function () {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell', 'entrance');
    });
});
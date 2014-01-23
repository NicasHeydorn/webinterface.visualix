(function(window) {
    var visualix = {};

    visualix.initCarousel = function() {
        var images = ['images/27-wallpapers-suits-tv-series.jpg', 'images/the-hangover-4fe2074315423.jpg', 'images/dexter-classic-poster.jpg', 'images/fe8015b5e69d0b482d761c83e700aa75_large.jpg'];
        var $background = $('.background');

        var changeBackground = function(fadeDelay, previousIndex) {
            var index = previousIndex;
            while (index === previousIndex) {
                index = Math.floor((Math.random() * (images.length)));
            }

            $background.fadeOut(fadeDelay, function() {
                $background.css({ 'background-image': 'url(' + images[index] + ')' });
                $background.fadeIn(fadeDelay);
            });

            window.setTimeout(function() {
                changeBackground(500, index);
            }, 7000);
        };

        changeBackground(0, -1);
    };

    visualix.enforceImageHeight = function (maxHeight) {
        $('.movie-info .image').each(function() {
            var $that = $(this);
            $('img', $that).each(function() {
                var $img = $(this);
                var height = $img.height();

                if (height > maxHeight) {
                    var start = (height - maxHeight) / 2;
                    var end = start + maxHeight;
                    $img.css({ position: 'absolute', clip: 'rect(' + start + 'px auto ' + end + 'px auto)', top: '-' + start + 'px' });
                }
            });

            $that.height(150);
        });
    };

    window.visualix = visualix;
})(window);
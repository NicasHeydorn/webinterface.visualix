(function(window) {
    var xbmc = {
        defaultOptions: {
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            success: function(data) {
                /*console.log(data);*/ // Enable to always show xbmc request output in console.
            }
        },
        request: function(options) {
            var requestOptions = $.extend({}, this.defaultOptions, options);

            requestOptions.url = '/jsonrpc?' + options.method;
            requestOptions.data = JSON.stringify({
                jsonrpc: '2.0',
                method: options.method,
                id: 1,
                params: requestOptions.params
            });

            return $.ajax(requestOptions);
        },
        getRequestOptions: function(options) {
            var requestOptions = $.extend({}, this.defaultOptions, options);

            requestOptions.url = '/jsonrpc?' + requestOptions.method;
            requestOptions.data = JSON.stringify({
                jsonrpc: '2.0',
                method: requestOptions.method,
                id: 1,
                params: requestOptions.params
            });

            return requestOptions;
        }
    };

    xbmc.cache = {
        recentmovies: {},
        recentepisodes: {},
        allmovies: {},
        movies: {},
        tvshows: {},
        seasons: {},
        episodes: {},
        searchdata: []
    };

    xbmc.options = {
        allMovies: function() {
            return {
                'context': this,
                'method': 'VideoLibrary.GetMovies',
                'params': {
                    'limits': {
                        'start': 0
                    },
                    'properties': [
                        'title',
                        'originaltitle',
                        'lastplayed',
                        'runtime',
                        'playcount',
                        'rating',
                        'thumbnail',
                        'art'
                    ],
                    'sort': {
                        'method': 'sorttitle',
                        'ignorearticle': true
                    }
                }
            };
        },

        allTVShows: function() {
            return {
                'context': this,
                'method': 'VideoLibrary.GetTVShows',
                'params': {
                    'limits': {
                        'start': 0
                    },
                    'properties': [
                        'title',
                        'episode',
                        'watchedepisodes',
                        'rating',
                        'thumbnail'
                    ],
                    'sort': {
                        'method': 'sorttitle',
                        'ignorearticle': true
                    }
                }
            };
        },

        recentMovies: function() {
            return {
                'context': this,
                'method': 'VideoLibrary.GetRecentlyAddedMovies',
                'params': {
                    'limits': {
                        'start': 0,
                        'end': 10
                    },
                    'properties': [
                        'title',
                        'originaltitle',
                        'lastplayed',
                        'runtime',
                        'playcount',
                        'rating',
                        'thumbnail',
                        'art'
                    ],
                    'sort': {
                        'method': 'dateadded',
                        'order': 'descending'
                    }
                }
            };
        },

        movieDetails: function(movieid) {
            return {
                'context': this,
                'method': 'VideoLibrary.GetMovieDetails',
                'params': {
                    'movieid': movieid,
                    'properties': [
                        'genre',
                        'director',
                        'trailer',
                        'tagline',
                        'plot',
                        'plotoutline',
                        'title',
                        'originaltitle',
                        'lastplayed',
                        'runtime',
                        'year',
                        'playcount',
                        'rating',
                        'thumbnail',
                        'file',
                        'fanart',
                        'writer',
                        'cast',
                        'sorttitle',
                        'country'
                    ]
                }
            };
        },

        recentEpisodes: function() {
            return {
                'context': this,
                'method': 'VideoLibrary.GetRecentlyAddedEpisodes',
                'params': {
                    'limits': {
                        'start': 0,
                        'end': 10
                    },
                    'properties': [
                        'title',
                        'originaltitle',
                        'lastplayed',
                        'runtime',
                        'playcount',
                        'rating',
                        'thumbnail',
                        'art'
                    ],
                    'sort': {
                        'method': 'dateadded',
                        'order': 'descending'
                    }
                }
            };
        },

        episodeDetails: function(episodeid) {
            return {
                'context': this,
                'method': 'VideoLibrary.GetEpisodeDetails',
                'params': {
                    'episodeid': episodeid,
                    'properties': [
                        'title',
                        'rating',
                        'lastplayed',
                        'art',
                        'plot',
                        'file',
                        'playcount',
                        'writer',
                        'cast',
                        'director',
                        'runtime',
                        'firstaired',
                        'tvshowid',
                        'season'
                    ]
                }
            };
        },

        seasonEpisodesDetails: function(tvshowid, seasonid) {
            return {
                'context': this,
                'method': 'VideoLibrary.GetEpisodes',
                'params': {
                    'tvshowid': tvshowid,
                    'season': seasonid,
                    'properties': [
                        'title',
                        'rating',
                        'lastplayed',
                        'art',
                        'plot',
                        'file',
                        'playcount',
                        'writer',
                        'cast',
                        'director',
                        'runtime',
                        'firstaired',
                        'tvshowid',
                        'season'
                    ]
                }
            };
        },

        seasonDetails: function(tvshowid) {
            return {
                'context': this,
                'method': 'VideoLibrary.GetSeasons',
                'params': {
                    'tvshowid': tvshowid,
                    'properties': [
                        'episode',
                        'tvshowid',
                        'watchedepisodes',
                        'season',
                        'showtitle'
                    ],
                    'sort': {
                        method: 'season'
                    }
                }
            };
        },

        tvshowDetails: function(tvshowid) {
            return {
                'context': this,
                'method': 'VideoLibrary.GetTVShowDetails',
                'params': {
                    'tvshowid': tvshowid,
                    'properties': [
                        'title',
                        'rating',
                        'art',
                        'plot',
                        'cast',
                        'premiered',
                        'episode',
                        'watchedepisodes'
                    ]
                }
            };
        },

        playFile: function(file) {
            return {
                'context': this,
                'method': 'Player.Open',
                'params': {
                    'item': {
                        'file': file
                    }
                }
            };
        },

        moviesForSearch: function () {
            return {
                'context': this,
                'method': 'VideoLibrary.GetMovies',
                'params': {
                    'limits': {
                        'start': 0
                    },
                    'properties': [
                        'title'
                    ],
                    'sort': {
                        'method': 'sorttitle',
                        'ignorearticle': true
                    }
                }
            };
        },

        episodesForSearch: function () {
            return {
                'context': this,
                'method': 'VideoLibrary.GetEpisodes',
                'params': {
                    'limits': {
                        'start': 0
                    },
                    'properties': [
                        'showtitle',
                        'season',
                        'tvshowid'
                    ],
                    'sort': {
                        'method': 'sorttitle',
                        'ignorearticle': true
                    }
                }
            };
        },
    };

    window.xbmc = xbmc;
})(window);
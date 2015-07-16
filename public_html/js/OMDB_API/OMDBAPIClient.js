/**
 * This is the JavaScript layer of the OMDB API. Needs some more refactoring, it has been used
 * mostly for testing. but it works like a charm.
 * @returns {OMDBAPIClient} The Client to access the JSON API of IMDB
 */
function OMDBAPIClient(sInstanceName) {
    /**
     * We may want async mode for testing the data and not having to use callbacks. I do, anyway
     */
    this.useSyncAjaxMode = false;

    /**
     * The data returned by the last query
     */
    this.oAPILastQueryData = null;

    /**
     * Max number of seasons to scan for
     */
    this.iMaxSeasons = 2;

    /**
     * Max number of episodes to scan for in a season
     */
    this.iMaxEpisodes = 10;

    this.iEpisodesAdded = 0;
    this.iEpisodesMissed = 0;
    this.iMaxEpisodesScanned = this.iMaxSeasons * this.iMaxEpisodes;

    this.iLastSeasonInserted = 0;
    this.iLastEpisodeInserted = 0;

    this.sSeriesName = "";

    /**
     * Base URL of the OMDB API
     */
    this.sOMDBAPIBaseURL = "http://www.omdbapi.com/";

    /**
     * Whether or not we are in debug mode
     */
    this.bDebug = true;

    this.sInstanceName = sInstanceName;

    // 0 - localStorage
    // 1 - LAMP
    // 2 - node.js + MySQL
    this.iDataOrigin = 0;       // Default localStorage


}

/**
 * Tired of coding ajax requests, i make this function:
 * @param {type} oAjaxRequestStruct
 * 
 * {
 *      sURL: The URL
 *      funcSuccessHandler: success handler
 *      funcErrorHandler: error handler
 * }
 *       
 * 
 * @returns {undefined}
 */
OMDBAPIClient.prototype.JSONRequest = function (oAjax) {
    $.ajax({
        url: oAjax.sURL,
        method: 'GET',
        success: oAjax.funcSuccessHandler,
        error: oAjax.funcErrorHandler
    });
};

OMDBAPIClient.prototype.initObject = function (iSeasons, iEpisodes) {
    this.iMaxSeasons = (iSeasons > 0) ? iSeasons : this.iMaxSeasons;
    this.iMaxEpisodes = (iEpisodes > 0) ? iEpisodes : this.iMaxEpisodes;
    this.iMaxEpisodesScanned = this.iMaxSeasons * this.iMaxEpisodes;
    this.oLastScannedSeries = {};
    this.oLastScannedSeries.Seasons = new Array();
    for (var i = 0; i < this.iMaxSeasons; i++) {
        this.oLastScannedSeries.Seasons[i] = {};
        this.oLastScannedSeries.Seasons[i].Episodes = new Array();
    }
};

/**
 * This method makes the queries to the OMDB JSON API and stores
 * the result within the class properties
 * @param {Object} oStruct The data structure that represents the search parameters
 * @returns {undefined} Nothing, works async
 */
OMDBAPIClient.prototype.query = function (oStruct) {
    var sUrl = this.sOMDBAPIBaseURL;

    // We are going to add this param always by default
    sUrl += "?r=json"

    // We start looking for possible params to add to the query      
    sUrl += (oStruct.hasOwnProperty('type')) ? "&type=" + oStruct.type : "&type=series";

    sUrl += (oStruct.hasOwnProperty('season')) ? "&Season=" + oStruct.season : "";

    sUrl += (oStruct.hasOwnProperty('episode')) ? "&Episode=" + oStruct.episode : "";

    sUrl += (oStruct.hasOwnProperty('title')) ? "&t=" + oStruct.title : (oStruct.hasOwnProperty('search')) ? "&s=" + oStruct.search : "";

    sUrl += (oStruct.hasOwnProperty('year')) ? "&y=" + oStruct.year : "";

    sUrl += (oStruct.hasOwnProperty('fullplot')) ? "&plot=full" : "";

    sUrl += (oStruct.hasOwnProperty('rt')) ? "&tomatoes=true" : "";

    // Context is not the same within ajax call and subsequent callbacks
    var _self = this;

    // We make the call itself
    $.ajax({
        url: sUrl,
        type: 'json',
        method: 'GET',
        async: (_self.useSyncAjaxMode === true) ? false : true,
        success: function (sData) {
            _self.oAPILastQueryData = sData;
            if (_self.bDebug) {
                console.log(sData);
            }
        }
    });
};

OMDBAPIClient.prototype.getMovieByID = function (iIMDBID) {
    var oAjax = {
        sURL: gbl_aDataOriginsURL[this.iDataOrigin].getMovieByID(iIMDBID),
        funcSuccessHandler: function (oData) {
            $.event.trigger("OMDBAPIClient::GetMovieByID::OK", oData);
        },
        funcErrorHandler: function (oErrorData) {
            $.event.trigger("OMDBAPIClient::GetMovieByID::KO", oErrorData);
        }
    };
    this.JSONRequest(oAjax);
};

/**
 * Get a movie by its title.
 * @param {String} sTitle The string to use for search in the title field
 * @returns {undefined}
 */
OMDBAPIClient.prototype.getMovieByTitle = function (sTitle) {
    var oAjax = {
        sURL: gbl_aDataOriginsURL[this.iDataOrigin].getMovieByTitle(sTitle),
        funcSuccessHandler: function (oData) {
            $.event.trigger("OMDBAPIClient::GetMovieByTitle::OK", oData);
        },
        funcErrorHandler: function (oErrorData) {
            $.event.trigger("OMDBAPIClient::GetMovieByTitle::KO", oErrorData);
        }
    };
    this.JSONRequest(oAjax);
};

/**
 * Get a movie by a text search.
 * @param {String} sSearch The string to use for the text search
 * @returns {undefined}
 */
OMDBAPIClient.prototype.searchMovies = function (sSearch) {
    var oAjax = {
        /* sURL: this.sOMDBAPIBaseURL + "?s=" + sSearch + "&type=movie&plot=full", */
        sURL: gbl_aDataOriginsURL[this.iDataOrigin].searchMovies(sSearch),
        funcSuccessHandler: function (oData) {
            $.event.trigger("OMDBAPIClient::SearchMovies::OK", oData);
        },
        funcErrorHandler: function (oErrorData) {
            $.event.trigger("OMDBAPIClient::SearchMovies::OK", oErrorData);
        }
    };
    //@TODO: Sync mode
    this.JSONRequest(oAjax);
};

/**
 * Get a series by its title
 * @param {String} sTitle The string to use for search in the title field
 * @returns {undefined}
 */
OMDBAPIClient.prototype.getSeriesByTitle = function (sTitle) {
    var oAjax = {
        sURL: gbl_aDataOriginsURL[this.iDataOrigin].getSeriesByTitle(sTitle),
        funcSuccessHandler: function (oData) {
            $.event.trigger("OMDBAPIClient::GetSeriesByTitle::OK", oData);
        },
        funcErrorHandler: function (oErrorData) {
            $.event.trigger("OMDBAPIClient::GetSeriesByTitle::KO", oErrorData);
        }
    };
    this.JSONRequest(oAjax);
};

OMDBAPIClient.prototype.getSeriesByID = function (iIMDBID) {
    var oAjax = {
        sURL: gbl_aDataOriginsURL[this.iDataOrigin].getSeriesByID(iIMDBID),
        funcSuccessHandler: function (oData) {
            $.event.trigger("OMDBAPIClient::GetSeriesByID::OK", oData);
        },
        funcErrorHandler: function () {
            $.event.trigger("OMDBAPIClient::GetSeriesByID::KO", oErrorData);
        }
    };
    this.JSONRequest(oAjax);
};

OMDBAPIClient.prototype.searchSeries = function (sSeriesTitle) {
    var oAjax = {
        sURL: gbl_aDataOriginsURL[this.iDataOrigin].searchSeries(sSeriesTitle),
        funcSuccessHandler: function (oData) {
            $.event.trigger("OMDBAPIClient::SearchSeries::OK", oData);
        },
        funcErrorHandler: function (oErrorData) {
            $.event.trigger("OMDBAPIClient::SearchSeries::KO", oErrorData);
        }
    };
    this.JSONRequest(oAjax);
};

OMDBAPIClient.prototype.getEpisodeBySeriesName = function (sName, iSeason, iEpisode) {
    var oAjax = {
        sURL: gbl_aDataOriginsURL[this.iDataOrigin].getEpisodeBySeriesName(sName, iSeason, iEpisode),
        funcSuccessHandler: function (oData) {
            $.event.trigger("OMDBAPIClient::GetEpisodeBySeriesName::OK", oData);
        },
        funcErrorHandler: function (oErrorData) {
            $.event.trigger("OMDBAPIClient::GetEpisodeBySeriesName::KO", oErrorData);
        }
    };
    this.JSONRequest(oAjax);
};

OMDBAPIClient.prototype.addEpisode = function (oEpisodeData, iSeason, iEpisode, sAJAXSeriesName) {    
    var oEpisode = new Episode();    
    if (oEpisodeData.Response === "True") {
        oEpisode.sTitle = oEpisodeData.Title;
        oEpisode.fIMDBRating = oEpisodeData.imdbRating;
        oEpisode.iYear = oEpisodeData.Year;
        oEpisode.sPlot = oEpisodeData.Plot;
        oEpisode.fRuntime = oEpisodeData.Runtime;
        oEpisode.iIMDBID = oEpisodeData.imdbID;
        oEpisode.iIMDBVotes = oEpisodeData.imdbVotes;
        oEpisode.iSeriesIMDBID = oEpisodeData.seriesID;
        oEpisode.sReleaseDate = oEpisodeData.Released;
        oEpisode.aGenres = oEpisodeData.Genre.split(",");
        oEpisode.aActors = oEpisodeData.Actors.split(",");
        oEpisode.sPosterURL = oEpisodeData.Poster;
        oEpisode.iSeason = iSeason;
        oEpisode.iEpisodeInSeason = iEpisode;
        oEpisode.sSeriesName = sAJAXSeriesName;
    } else {        
        this.iEpisodesMissed++;
    }
    
    this.oLastScannedSeries.Seasons[iSeason].Episodes[iEpisode] = oEpisode;
    this.iEpisodesAdded++;
    
        if ((this.iEpisodesAdded + this.iEpisodesMissed) === this.iMaxEpisodesScanned) {
            if(this.iEpisodesMissed === this.iEpisodesAdded) {
                $.event.trigger("OMDBAPIClient::ScanSeries::KO", this.sInstanceName);
            } else {
                this.cleanSeriesArray();
                $.event.trigger("OMDBAPIClient::ScanSeriesFinished", this.sInstanceName);
            }
        }
    
};

OMDBAPIClient.prototype.cleanSeriesArray = function () {
    var iCut = 0;
    var iSeasons = this.oLastScannedSeries.Seasons.length;
    for (var i = 0; i < iSeasons; i++) {
        if (this.oLastScannedSeries.Seasons[i].Episodes.length === 0) {
            iCut = i;
            break;
        }
    }
    this.oLastScannedSeries.Seasons.splice(iCut, (iSeasons - i));
};

OMDBAPIClient.prototype.seriesSeasonEpisodeURL = function (sSeriesName, iSeason, iEpisode) {
    return this.sOMDBAPIBaseURL + "?t=" + sSeriesName + "&Season=" + (iSeason + 1) + "&Episode=" + (iEpisode + 1) + "&plot=full";
};

/**
 * This method scans a series by its title. It tries to retrieve iSeasonsMax
 * seasons, and iMaxEpisodes in each season.
 * @TODO: More efficient, there is quite a lot of free space in the data struct
 * @TODO: Refactor for when.then using jQuery deferred objects.
 * Tried to, cannot find how to access the success handler of each defered object :-(
 * @param {String} sSeriesName The name of the series
 * @param {Integer} iSeasonsMax The max number of seasons to scan for
 * @param {Integer} iEpisodesMax The max number of episodes to scan for in each season
 * @returns {undefined}
 */
OMDBAPIClient.prototype.scanSeries = function (sSeriesName, iSeasonsMax, iEpisodesMax) {
    this.iEpisodesAdded = 0;
    this.iEpisodesMissed = 0;
    this.initObject();

    this.sSeriesName = sSeriesName;
    for (var i = 0; i < iSeasonsMax; i++) {
        for (var j = 0; j < iEpisodesMax; j++) {

            var sUrl = this.seriesSeasonEpisodeURL(sSeriesName, i, j);
            var _self = this;

            // No functiona, porque this.iEpisode no existe una vez ha pasado por el contexto
            // de this.JSONRequest.
            /* var oAjax = {
             sURL: gbl_aDataOriginsURL[this.iDataOrigin].scanSeriesIMDB(sSeriesName, i, j),
             iSeason: i,
             iEpisode: j,
             sAJAXSeriesName: sSeriesName,
             funcSuccessHandler: function(oData) {
             _self.addEpisode(oData, this.iSeason, this.iEpisode, this.sAJAXSeriesName);
             }
             }; */
            // this.JSONRequest(oAjax);

            $.ajax({
                url: gbl_aDataOriginsURL[this.iDataOrigin].scanSeriesIMDB(sSeriesName, i, j),
                type: 'json',
                method: 'GET',
                iSeason: i,
                iEpisode: j,
                sAJAXSeriesName: sSeriesName,
                success: function (data) {
                    _self.addEpisode(data, this.iSeason, this.iEpisode, this.sAJAXSeriesName);
                }
            });
        }
    }
};
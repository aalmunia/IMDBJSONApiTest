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
    this.iMaxSeasons = 7;

    /**
     * Max number of episodes to scan for in a season
     */
    this.iMaxEpisodes = 30;

    this.iEpisodesAdded = 0;
    this.iEpisodesMissed = 0;
    this.iMaxEpisodesScanned = this.iMaxSeasons * this.iMaxEpisodes;

    this.iLastSeasonInserted = 0;
    this.iLastEpisodeInserted = 0;

    //@TODO: Transformar a Series, Season, Episode
    this.oLastScannedSeries = {};

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
    var _self = this;
    $.ajax({
        url: oAjax.sURL,
        method: 'GET',
        async: (_self.useSyncAjaxMode === true) ? false : true,
        success: oAjax.funcSuccessHandler,
        error: oAjax.funcErrorHandler
    });
};

OMDBAPIClient.prototype.initObject = function (iSeasons, iEpisodes) {
    this.iMaxSeasons = (iSeasons > 0) ? iSeasons : this.iMaxSeasons;
    this.iMaxEpisodes = (iEpisodes > 0) ? iEpisodes : this.iMaxEpisodes;
    this.iMaxEpisodesScanned = this.iMaxSeasons * this.iMaxEpisodes;
    this.oLastScannedSeries = new Series();    
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
        },
        error: function (oError) {
            console.log("AJAX Error: ");
            console.log(oError);
        }
    });
};

OMDBAPIClient.prototype.getMovieByID = function (sIMDBID) {
    var oAjax = {
        sURL: gbl_aDataOriginsURL[this.iDataOrigin].getMovieByID(sIMDBID),
        funcSuccessHandler: function (oData) {
            /* if(oData.Response === undefined) {
                oData = JSON.parse(oData);
            } */
            if (oData.Response === "False") {
                $.event.trigger("OMDBAPIClient::GetMovieByID::KO");
            } else {
                $.event.trigger("OMDBAPIClient::GetMovieByID::OK", oData);
            }
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
            if (oData.Response === "False") {
                $.event.trigger("OMDBAPIClient::GetMovieByTitle::KO");
            } else {
                $.event.trigger("OMDBAPIClient::GetMovieByTitle::OK", oData);
            }
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
            if(oData.Search === undefined) {
                oData = JSON.parse(oData);
            }
            if (oData.Response === "False") {
                $.event.trigger("OMDBAPIClient::SearchMovies::KO");
            } else {
                $.event.trigger("OMDBAPIClient::SearchMovies::OK", oData);
            }
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
            if (oData.Response === "False") {
                $.event.trigger("OMDBAPIClient::GetSeriesByTitle::KO");
            } else {
                $.event.trigger("OMDBAPIClient::GetSeriesByTitle::OK", oData);
            }
        },
        funcErrorHandler: function (oErrorData) {
            $.event.trigger("OMDBAPIClient::GetSeriesByTitle::KO", oErrorData);
        }
    };
    this.JSONRequest(oAjax);
};

OMDBAPIClient.prototype.getSeriesByID = function (sIMDBID) {
    var oAjax = {
        sURL: gbl_aDataOriginsURL[this.iDataOrigin].getSeriesByID(sIMDBID),
        funcSuccessHandler: function (oData) {
            if (oData.Response === "False") {
                $.event.trigger("OMDBAPIClient::GetSeriesByID::KO");
            } else {
                $.event.trigger("OMDBAPIClient::GetSeriesByID::OK", oData);
            }
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
            if (oData.Response === "False") {
                $.event.trigger("OMDBAPIClient::SearchSeries::KO");
            } else {
                $.event.trigger("OMDBAPIClient::SearchSeries::OK", oData);
            }
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
            if (oData.Response === "False") {
                $.event.trigger("OMDBAPIClient::GetEpisodeBySeriesName::KO");
            } else {
                $.event.trigger("OMDBAPIClient::GetEpisodeBySeriesName::OK", oData);
            }
        },
        funcErrorHandler: function (oErrorData) {
            $.event.trigger("OMDBAPIClient::GetEpisodeBySeriesName::KO", oErrorData);
        }
    };
    this.JSONRequest(oAjax);
};

OMDBAPIClient.prototype.addEpisode = function (oEpisodeData, iSeason, iEpisode, sAJAXSeriesName, oNotificationObject) {
    var oEpisode = new Episode();
    
    if (oEpisodeData.Response === "True") {
        oEpisode.sTitle = oEpisodeData.Title;
        oEpisode.fIMDBRating = oEpisodeData.imdbRating;
        oEpisode.iYear = oEpisodeData.Year;
        oEpisode.sPlot = oEpisodeData.Plot;
        oEpisode.fRuntime = oEpisodeData.Runtime;
        oEpisode.sIMDBID = oEpisodeData.imdbID;
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
        oEpisode.iEpisodeInSeason = iEpisode;
        this.iEpisodesMissed++;
    }

    this.oLastScannedSeries.Seasons[iSeason].Episodes[iEpisode] = oEpisode;
    this.iEpisodesAdded++;
    
    var sPercentDone = Math.floor((this.iEpisodesAdded / this.iMaxEpisodesScanned) * 100) + " %";
    var sMessage = "Escaneado " + sPercentDone + " del total...";
    oNotificationObject.update('message', sMessage);

    if (this.iEpisodesMissed === this.iMaxEpisodesScanned) {
        this.oLastScannedSeries.sName = sAJAXSeriesName;
        oNotificationObject.close();
        $.event.trigger("OMDBAPIClient::ScanSeries::KO");        
    } else if (this.iEpisodesAdded === this.iMaxEpisodesScanned) {
        this.sSeriesName = sAJAXSeriesName;
        this.cleanSeriesArray();
        oNotificationObject.close();
        $.event.trigger("OMDBAPIClient::ScanSeries::OK", this.sInstanceName);
    }

};

OMDBAPIClient.prototype.isSeasonEmpty = function (oSeason) {
    var iEmpty = 0;
    for (var i = 0; i < oSeason.Episodes.length; i++) {
        if (oSeason.Episodes[i].sIMDBID === 0) {
            ++iEmpty;
        }
    }
    if (iEmpty === oSeason.Episodes.length) {
        return true;
    } else {
        return false;
    }
};

OMDBAPIClient.prototype.cleanSeasonArray = function (iSeason) {
    var iEpisodes = this.oLastScannedSeries.Seasons[iSeason].Episodes.length;
    var aNewEpisodes = [];
    var iNewEpisodes = 0;
    for (var i = 0; i < iEpisodes; i++) {        
        if (this.oLastScannedSeries.Seasons[iSeason].Episodes[i].sIMDBID !== 0) {            
            aNewEpisodes[iNewEpisodes] = this.oLastScannedSeries.Seasons[iSeason].Episodes[i];
            iNewEpisodes++;
        }
    }
    this.oLastScannedSeries.Seasons[iSeason].Episodes = aNewEpisodes;
};

OMDBAPIClient.prototype.cleanSeriesArray = function () {
    var iCut = 0;
    var iSeasons = this.oLastScannedSeries.Seasons.length;
    for (var i = 0; i < iSeasons; i++) {
        if (this.isSeasonEmpty(this.oLastScannedSeries.Seasons[i]) === true) {
            iCut = i;
            break;
        }
    }
    this.oLastScannedSeries.Seasons.splice(iCut, (iSeasons - i));
    iSeasons = this.oLastScannedSeries.Seasons.length;

    for (var j = 0; j < iSeasons; j++) {
        this.cleanSeasonArray(j);
    }
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
    this.initObject(iSeasonsMax, iEpisodesMax);
    var _self = this;

    this.sSeriesName = sSeriesName;
    this.oLastScannedSeries.sName = sSeriesName;
    
    var oNotify = $.notify("Escaneando serie... ");    
    
    for (var i = 0; i < iSeasonsMax; i++) {
        for (var j = 0; j < iEpisodesMax; j++) {            
            $.ajax({
                url: gbl_aDataOriginsURL[this.iDataOrigin].scanSeriesIMDB(sSeriesName, i, j),
                type: 'json',
                method: 'GET',
                async: (_self.useSyncAjaxMode === true) ? false : true,
                iSeason: i,
                iEpisode: j,
                timeout: 15000,
                oNotificationObject: oNotify,
                sAJAXSeriesName: sSeriesName,
                success: function (data) {
                    _self.addEpisode(data, this.iSeason, this.iEpisode, this.sAJAXSeriesName, this.oNotificationObject);
                },
                error: function (oError) {                    
                    _self.addEpisode({Response: "False"}, this.iSeason, this.iEpisode, this.sAJAXSeriesName, this.oNotificationObject);
                    console.log("AJAX Error: ");
                    console.log(oError);
                }
            });
        }
    }
};

OMDBAPIClient.prototype.saveSeriesData = function () {
    //@TODO: Maybe refactor this, create saver object

    // Read data from grids, modifications go there
    for (var i = 0; i < this.oLastScannedSeries.Seasons.length; i++) {
        var sGrid = "#Grid_" + i;
        var oDataGrid = $(sGrid).bootstrapTable('getData');
        this.oLastScannedSeries.Seasons[i] = oDataGrid;
    }
    
    var sJSONString = JSON.stringify(this.oLastScannedSeries);

    //@TODO: El nombre de la serie está vacío tras la deserialización
    // Al volver a serializar, se queda vacío. Resolver de alguna forma
    if (this.iDataOrigin === 0) {
        if (typeof (Storage) !== "undefined") {
            var sKey = "OMDBAPI_Series_" + this.oLastScannedSeries.sName.replace(" ", "_");
            console.log(sJSONString);
            localStorage.setItem(sKey, sJSONString);
            $.event.trigger("OMDBAPIClient::SaveSeriesData::OK");
        } else {
            $.event.trigger("OMDBAPIClient::SaveSeriesData::KO");
        }
    } else if (this.iDataOrigin === 1) {
        // Servicios POST de escritura de datos
        var sURL = document.location + 'php/index.php/series/saveSeries/';
        $.ajax({
            url: sURL,
            data: oClient.oLastScannedSeries,
            type: 'json',
            method: 'POST',
            success: function(data) {
                console.log(data);
            },
            error: function(data) {
                
            }
        });

    } else if (this.iDataOrigin === 2) {

    } else {
        // Should not go in here
        console.log("Error saving Series Data");
        console.log("Value of iDataOrigin for Object OMDBAPIClient, instance: " + this.sInstanceName);
        console.log(this.iDataOrigin);
    }
};


OMDBAPIClient.prototype.loadSeriesData = function (idSelect) {

    // var iLoaded = 0;
    if (this.iDataOrigin === 0) {
        if (typeof (Storage) !== "undefined") {
            for (var prop in localStorage) {
                if (prop.indexOf("OMDBAPI_Series") !== -1) {
                    var sOptionName = prop.replace("OMDBAPI_Series_", "").replace("_", " ");
                    var optSeriesNew = document.createElement('option');
                    optSeriesNew.value = prop;
                    optSeriesNew.innerHTML = sOptionName;
                    $("#" + idSelect).append(optSeriesNew);
                }
            }
        } else {
            throw "No hay localStorage. Cambia la configuración a otro tipo de almacenamiento si quieres guardar datos";
        }
    } else if (this.iDataOrigin === 1) {
        // Servicios GET de lectura de datos
        
    } else if (this.iDataOrigin === 2) {

    } else {

    }
};
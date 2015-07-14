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
    this.iMaxSeasons = 10;
    
    /**
     * Max number of episodes to scan for in a season
     */
    this.iMaxEpisodes = 30;
    
    this.iLastSeasonInserted = 0;
    this.iLastEpisodeInserted = 0;
    
    /**
     * Base URL of the OMDB API
     */
    this.sOMDBAPIBaseURL = "http://www.omdbapi.com/";
    
    /**
     * Whether or not we are in debug mode
     */
    this.bDebug = true;
    
    this.sInstanceName = sInstanceName;
        
    this.oLastScannedSeries = {};
    this.oLastScannedSeries.Seasons = new Array();
    for(var i = 0; i < this.iMaxSeasons; i++) {
        this.oLastScannedSeries.Seasons[i] = {};
        this.oLastScannedSeries.Seasons[i].Episodes = new Array();        
    }    
}

/**
 * This method makes the queries to the OMDB JSON API and stores
 * the result within the class properties
 * @param {Object} oStruct The data structure that represents the search parameters
 * @returns {undefined} Nothing, works async
 */
OMDBAPIClient.prototype.query = function(oStruct) {
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
          success: function(sData) {
              _self.oAPILastQueryData = sData;
              if(_self.bDebug) {
                console.log(sData);
              }
          }
      });  
};

/**
 * Get a movie by its title.
 * @param {String} sTitle The string to use for search in the title field
 * @returns {undefined}
 */
OMDBAPIClient.prototype.getMovieByTitle = function(sTitle) {
    oStruct = {
        type: 'movie',
        title: sTitle
    };
    this.query(oStruct);
};

/**
 * Get a movie by a text search.
 * @param {String} sSearch The string to use for the text search
 * @returns {undefined}
 */
OMDBAPIClient.prototype.getMovieBySearch = function(sSearch) {
    oStruct = {
        type: 'movie',
        search: sSearch
    };
    this.query(oStruct);
};

/**
 * Get a movie by several params
 * @param {Object} oStruct The object with the params
 * @returns {undefined}
 */
OMDBAPIClient.prototype.getMovieByParams = function(oStruct) {
    oStruct.type = 'movie';
    this.query(oStruct);
};

/**
 * Get a series by its title
 * @param {String} sTitle The string to use for search in the title field
 * @returns {undefined}
 */
OMDBAPIClient.prototype.getSeriesByTitle = function(sTitle) {
    oStruct = {
        type: 'series',
        title: sTitle
    };
    this.query(oStruct);
};

/**
 * Get a series by text search
 * @param {String} sSearch The string to use for text search
 * @returns {undefined}
 */
OMDBAPIClient.prototype.getSeriesBySearch = function(sSearch) {
    oStruct = {
      type: 'series',
      search: sSearch
    };
    this.query(oStruct);
};

/**
 * Get a series by several params
 * @param {Object} oStruct The struct to use for the search
 * @returns {undefined}
 */
OMDBAPIClient.prototype.getSeriesByParams = function(oStruct) {
    oStruct.type = 'series';
    this.query(oStruct);
};

OMDBAPIClient.prototype.addEpisode = function(oEpisodeData, iSeason, iEpisode) {    
    this.oLastScannedSeries.Seasons[iSeason].Episodes[iEpisode] = oEpisodeData;
};

OMDBAPIClient.prototype.cleanSeriesArray = function() {
    var iCut = 0;
    var iSeasons = this.oLastScannedSeries.Seasons.length;
    for(var i = 0; i < iSeasons; i++) {
        if(this.oLastScannedSeries.Seasons[i].Episodes.length === 0) {
            iCut = i;
            break;
        }
    }
    this.oLastScannedSeries.Seasons.splice(iCut, (iSeasons - i));
};

/**
 * This method scans a series by its title. It tries to retrieve iSeasonsMax
 * seasons, and iMaxEpisodes in each season.
 * @TODO: More efficient, there is quite a lot of free space in the data struct
 * @param {String} sSeriesName The name of the series
 * @param {Integer} iSeasonsMax The max number of seasons to scan for
 * @param {Integer} iEpisodesMax The max number of episodes to scan for in each season
 * @returns {undefined}
 */
OMDBAPIClient.prototype.scanSeries = function(sSeriesName, iSeasonsMax, iEpisodesMax) {
    for(var i = 0; i < iSeasonsMax; i++) {        
        for(var j = 0; j < iEpisodesMax; j++) {            
            var sUrl = this.sOMDBAPIBaseURL + "?t=" + sSeriesName + "&Season=" + (i + 1) + "&Episode=" + (j + 1);
            var _self = this;
            $.ajax({
                url: sUrl,
                type: 'json',
                method: 'GET',
                iSeason: i,
                iEpisode: j,
                success: function(oData) {
                    
                    if(oData.Response === "True") {
                        _self.addEpisode(oData, this.iSeason, this.iEpisode);
                    }
                    
                    if(this.iSeason === (iSeasonsMax - 1)) {                        
                        if(this.iEpisode === (iEpisodesMax - 1)) {
                            _self.cleanSeriesArray();
                            $.event.trigger("OMDBAPIClient::ScanSeriesFinished", _self.sInstanceName);
                        }
                    }
                }
            });
        }        
    }    
};
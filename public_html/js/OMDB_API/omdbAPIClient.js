/**
 * This is the JavaScript layer of the OMDB API. Needs some more refactoring, it has been used
 * mostly for testing. but it works like a charm.
 * @returns {OMDBAPIClient} The Client to access the JSON API of IMDB
 */
function OMDBAPIClient() {
    /**
     * We may want async mode for testing the data and not having to use callbacks. I do, anyway
     */
    this.useSyncAjaxMode = false;
    
    /**
     * The data returned by the last query
     */
    this.oAPILastQueryData = null;    
    this.iMaxSeasons = 10;      // Maybe a bit too much, but...
    this.iMaxEpisodes = 30;
    this.iLastSeasonInserted = 0;
    this.iLastEpisodeInserted = 0;
    this.sOMDBAPIBaseURL = "http://www.omdbapi.com/";    
    this.bDebug = true;
    
    //@TODO: Refactor this
    this.oLastScannedSeries = {};
    this.oLastScannedSeries.Seasons = new Array();
    for(var i = 0; i < this.iMaxSeasons; i++) {
        this.oLastScannedSeries.Seasons[i] = {};
        this.oLastScannedSeries.Seasons[i].Episodes = new Array();
        for(var j = 0; j < this.iMaxEpisodes; j++) {
            this.oLastScannedSeries.Seasons[i].Episodes[j] = {};
        }
    }
    // console.log(this.oLastScannedSeries);
}

OMDBAPIClient.prototype.query = function(oStruct) {
      var sUrl = this.sOMDBAPIBaseURL;
      
      // We are going to add these params always by default
      sUrl += "?r=json"
      
      // We start looking for possible params to add to the query      
      // Default series
      sUrl += (oStruct.hasOwnProperty('type')) ? "&type=" + oStruct.type : "&type=series";
      
      sUrl += (oStruct.hasOwnProperty('season')) ? "&Season=" + oStruct.season : "";
      
      sUrl += (oStruct.hasOwnProperty('episode')) ? "&Episode=" + oStruct.episode : "";
      
      // Going ternary all the way
      sUrl += (oStruct.hasOwnProperty('title')) ? "&t=" + oStruct.title : (oStruct.hasOwnProperty('search')) ? "&s=" + oStruct.search : "";      
      
      sUrl += (oStruct.hasOwnProperty('year')) ? "&y=" + oStruct.year : "";
            
      sUrl += (oStruct.hasOwnProperty('fullplot')) ? "&plot=full" : "";
      
      sUrl += (oStruct.hasOwnProperty('rt')) ? "&tomatoes=true" : "";
      
      console.log(sUrl);
      
      // Context is not the same within ajax call and subsequent callbacks
      var self = this;
      
      // We make the call itself
      $.ajax({
          url: sUrl,
          type: 'json',
          method: 'GET',
          async: (self.useSyncAjaxMode === true) ? false : true,
          success: function(sData) {
              self.oAPILastQueryData = sData;
              if(self.bDebug) {
                console.log(sData);
              }
          }
      });  
};

OMDBAPIClient.prototype.getMovieByTitle = function(sTitle) {
    oStruct = {
        type: 'movie',
        title: sTitle
    };
    this.query(oStruct);
};

OMDBAPIClient.prototype.getMovieBySearch = function(sSearch) {
    oStruct = {
        type: 'movie',
        search: sSearch
    };
    this.query(oStruct);
};

OMDBAPIClient.prototype.getMovieByParams = function(oStruct) {
    oStruct.type = 'movie';
    this.query(oStruct);
};

OMDBAPIClient.prototype.getSeriesByTitle = function(sTitle) {
    oStruct = {
        type: 'series',
        title: sTitle
    };
    this.query(oStruct);
};

OMDBAPIClient.prototype.getSeriesBySearch = function(sSearch) {
    oStruct = {
      type: 'series',
      search: sSearch
    };
    this.query(oStruct);
};

OMDBAPIClient.prototype.getSeriesByParams = function(oStruct) {
    oStruct.type = 'series';
    this.query(oStruct);
};

OMDBAPIClient.prototype.addEpisode = function(oEpisodeData, iSeason, iEpisode) {
    console.log(oEpisodeData);
    console.log(iSeason);
    console.log(iEpisode);
    console.log(this.oLastScannedSeries.Seasons);
    this.oLastScannedSeries.Seasons[iSeason].Episodes[iEpisode] = oEpisodeData;
};

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
                    } else {
                        _self.resizeSeriesArray(this.iSeason, this.iEpisode);
                    }
                }
            });
        }        
    }    
};
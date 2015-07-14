function OMDBAPIClient() {
    this.useSyncAjaxMode = false;   // For testing this is VERY useful
    this.oData = null;
    this.sOMDBAPIBaseURL = "http://www.omdbapi.com/";
    this.bDebug = true;
}

OMDBAPIClient.prototype.query = function(oStruct) {
      var sUrl = this.sOMDBAPIBaseURL;
      
      // We are going to add these params always by default
      sUrl += "?r=json"
      
      // We start looking for possible params to add to the query      
      // Default series
      sUrl += (oStruct.hasOwnProperty('type')) ? "&type=" + oStruct.type : "&type=series";
      
      // Going ternary
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
              self.oData = sData;
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
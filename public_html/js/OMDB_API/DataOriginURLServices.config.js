var gbl_aDataOriginsURL = [
    // IMDB API
    {
        searchSeries: function(sSeriesTitle) {
            return oClient.sOMDBAPIBaseURL + "?s=" + sSeriesTitle + "&type=series&plot=full";
        },
        getMovieByID: function(iIMDBID) {
            return oClient.sOMDBAPIBaseURL + "?i=" + iIMDBID + "&plot=full";
        },
        getSeriesByID: function(iIMDBID) {
            return oClient.sOMDBAPIBaseURL + "?i=" + iIMDBID + "&plot=full";
        },
        getSeriesByTitle: function(sTitle) {
            return oClient.sOMDBAPIBaseURL + "?t=" + sTitle + "&type=movie&plot=full";
        },
        searchMovies: function(sSearch) {
            return oClient.sOMDBAPIBaseURL + "?s=" + sSearch + "&type=movie&plot=full";
        },
        getMovieByTitle: function(sTitle) {
            return oClient.sOMDBAPIBaseURL + "?t=" + sTitle + "&type=movie&plot=full";
        },
        getEpisodeBySeriesName: function(sName, iSeason, iEpisode) {            
            return oClient.sOMDBAPIBaseURL + "?t=" + sName + "&Season=" + (iSeason + 1) + "&Episode=" + (iEpisode + 1) + "&plot=full";
        },
        scanSeriesIMDB: function(sSeriesName, iSeason, iEpisode) {
            return oClient.sOMDBAPIBaseURL + "?t=" + sSeriesName + "&Season=" + (iSeason + 1) + "&Episode=" + (iEpisode + 1) + "&plot=full";
        }
    },
    // PHP + MySQL
    // @TODO: Token de securización del API.
    // gbl_aAppConfig.sPHPSecurityToken - Cuando implementes el handshake
    {
        searchSeries: function(sSeriesTitle) {
            return document.location + "/php/index.php/searchSeries/" + sSeriesTitle;
        },
        getMovieByID: function(iIMDBID) {
            return document.location + "/php/index.php/getMovieByID/" + iIMDBID;
        },
        getSeriesByID: function(iIMDBID) {
            return document.location + "/php/index.php/getSeriesByID/" + iIMDBID;
        },
        searchMovies: function(sSearch) {
            return document.location + "/php/index.php/searchMovies/" + sSearch;
        }
    },
    // node.js + MySQL
    {
        
    }
];
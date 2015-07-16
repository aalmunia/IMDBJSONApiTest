$(document).bind("OMDBAPIClient::SearchMovies::OK", function(oEvent, oData) {    
    console.log("OMDBAPIClient::SearchMovies::OK");
    console.log(oData);
});

$(document).bind("OMDBAPIClient::SearchMovies::KO", function(oErrorData) {
    console.log(oErrorData);
});

$(document).bind("OMDBAPIClient::GetMovieByTitle::OK", function(oEvent, oData) {
    console.log("OMDBAPIClient::GetMovieByTitle::OK");
    console.log(oData);
});

$(document).bind("OMDBAPIClient::GetMovieByID::OK", function(oEvent, oData) {
    console.log("OMDBAPIClient::GetMovieByID::OK");
    console.log(oData);
});

$(document).bind("OMDBAPIClient::GetSeriesByTitle::OK", function(oEvent, oData) {
    console.log("OMDBAPIClient::GetSeriesByTitle::OK");
    console.log(oData);
});

$(document).bind("OMDBAPIClient::GetSeriesByID::OK", function(oEvent, oData) {
    console.log("OMDBAPIClient::GetSeriesByID::OK");
    console.log(oData);
});

$(document).bind("OMDBAPIClient::SearchSeries::OK", function(oEvent, oData) {
    console.log("OMDBAPIClient::SearchSeries::OK");
    console.log(oData);
});

$(document).bind("OMDBAPIClient::GetEpisodeBySeriesName::OK", function(oEvent, oData) {
    console.log("OMDBAPIClient::GetEpisodeBySeriesName::OK");
    console.log(oData);
});

var oClient = new OMDBAPIClient();
oClient.searchMovies("The Hunt");
oClient.getMovieByTitle("Avatar");
oClient.getMovieByID("tt0499549");
oClient.getSeriesByTitle("boardwalk");
oClient.getSeriesByID("tt0078886");
oClient.searchSeries("rome");
oClient.getEpisodeBySeriesName("Game of thrones", 2, 3);

/* QUnit.test("OMBD API Client Tests", function(assert) {
    
    // We set async mode to false to be able to test the results without need for
    // callbacks and more complex structures    
    oClient.useSyncAjaxMode = true;
    oClient.getMovieByTitle('XZDFERGBNMHTR');
    assert.equal("False", oClient.oAPILastQueryData.Response, "There are no movies called XZDFERGBNMHTR. Sorry, try another Alien planet.");
    oClient.getMovieBySearch('Hunt Red October');
    assert.equal(1990, oClient.oAPILastQueryData.Search[0].Year, "The Hunt for Red October is a 1990 film");
    oMovieParams = {
        search: 'hunt',
        year: '2006'
    };
    oClient.getMovieByParams(oMovieParams);
    assert.equal("tt0455829", oClient.oAPILastQueryData.Search[0].imdbID, "The Smart Hunt, a 2006 movie has the IMDB ID tt0455829");
    oClient.getSeriesByTitle('DFBSBSDFBSBSB');
    assert.equal("False", oClient.oAPILastQueryData.Response, "There are no series called DFBSBSDFBSBSB. Try an Alien planet. Far away.");
    oClient.getSeriesBySearch('True Detective');
    assert.equal("tt2356777", oClient.oAPILastQueryData.Search[0].imdbID, "True Detective has the IMDB ID tt2356777");
    oSeriesParams = {
        search: 'thrones',
        year: '2011'
    };
    oClient.getSeriesByParams(oSeriesParams);
    assert.equal(1, oClient.oAPILastQueryData.Search.length, "There is only one 'Game of thrones' series in 2011. Winter is coming...");    
}); */

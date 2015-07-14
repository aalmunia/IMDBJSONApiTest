QUnit.test("OMBD API Client Tests", function(assert) {
    var oClient = new OMDBAPIClient();
    // We set async mode to false to be able to test the results without need for
    // callbacks and more complex structures    
    oClient.useSyncAjaxMode = true;
    oClient.getMovieByTitle('XZDFERGBNMHTR');
    assert.equal("False", oClient.oData.Response, "There are no movies called XZDFERGBNMHTR. Sorry, try another Alien planet.");
    oClient.getMovieBySearch('Hunt Red October');
    assert.equal(1990, oClient.oData.Search[0].Year, "The Hunt for Red October is a 1990 film");
    oMovieParams = {
        search: 'hunt',
        year: '2006'
    };
    oClient.getMovieByParams(oMovieParams);
    assert.equal("tt0455829", oClient.oData.Search[0].imdbID, "The Smart Hunt, a 2006 movie has the IMDB ID tt0455829");
    oClient.getSeriesByTitle('DFBSBSDFBSBSB');
    assert.equal("False", oClient.oData.Response, "There are no series called DFBSBSDFBSBSB. Try an Alien planet. Far away.");
    oClient.getSeriesBySearch('True Detective');
    assert.equal("tt2356777", oClient.oData.Search[0].imdbID, "True Detective has the IMDB ID tt2356777");
    oSeriesParams = {
        search: 'thrones',
        year: '2011'
    };
    oClient.getSeriesByParams(oSeriesParams);
    assert.equal(1, oClient.oData.Search.length, "There is only one 'Game of thrones' series in 2011. Winter is coming...");
});
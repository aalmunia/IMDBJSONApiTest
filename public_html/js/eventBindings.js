$(document).bind("OMDBAPIClient::SearchSeries::OK", function (oEvent, oData) {
    $("#divGridSearchSeries").bootstrapTable('destroy');
    $("#divGridSearchSeries").bootstrapTable({
        sortable: true,
        columns: [
            {field: 'Title', title: 'Título', sortable: true},
            {field: 'imdbID', title: 'ID IMDB', sortable: true},
            {field: 'Year', title: 'Años'},
            {field: '', title: 'Temporadas', formatter: function (a, b, c) {
                    return "<input type='number' id='txtSeriesGridSeasons_" + c + "' />";
                }},
            {field: '', Title: 'Episodios', formatter: function (a, b, c) {
                    return "<input type='number' id='txtSeriesGridEpisodes_" + c + "' />";
                }},
            {field: '', Title: 'Escanear', formatter: function (a, b, c) {
                    var sSeriesName = b.Title;
                    var sHTML = "<button class='btn-primary' onclick=\"initiateSeriesScan('" + sSeriesName + "', " + c + ")\">Escanear</button>";
                    return sHTML;
                }}

        ],
        data: oData.Search
    });
});

$(document).bind("OMDBAPIClient::ScanSeries::OK", function (oEvent) {
    var iSeasons = oClient.oLastScannedSeries.Seasons.length;
    var sSeriesTitle = oClient.oLastScannedSeries.Seasons[0].Episodes[0].sSeriesName.capitalize();
    $("#divSeriesTitle").html(sSeriesTitle);
    renderSeasonTabsAndCaptions(iSeasons);
    renderGrids(iSeasons);
    // $("#divOverlay").hide();
    showMainContainer(0);
    $("#divSeriesGridContainer").show();
});

$(document).bind("OMDBAPIClient::ScanSeries::KO", function () {
    alert("No episodes found for that series");
    // $("#divOverlay").hide();
    showMainContainer(0);
    return false;
});

$(document).bind("OMDBAPIClient::SearchMovies::OK", function (oEvent, oMovies) {
    $("#GridMoviesSearchResults").bootstrapTable('destroy');
    $("#GridMoviesSearchResults").bootstrapTable({
        width: '100%',
        sortable: true,
        striped: true,
        /* classes: 'table table-hover table-condensed table-responsive table-full-width', */
        columns: [
            {field: 'imdbID', width: '20%', title: 'ID', sortable: true},
            {field: 'Title', width: '40%', title: 'Título', sortable: true},
            {field: 'Year', width: '20%', title: 'Año', sortable: true}
        ],
        onClickRow: function (oMovie) {
            console.log("oMovie clickRow Grid Movies");
            console.log(oMovie);

            //@TODO: This should go to OMDBAPIClient object
            $.ajax({
                /* url: oClient.sOMDBAPIBaseURL + "?i=" + oMovie.imdbID, */
                url: gbl_aDataOriginsURL[oClient.iDataOrigin].getMovieByID(oMovie.imdbID),
                method: 'GET',
                type: 'json',
                success: function (oMovieData) {
                    // console.log("Callback success ")
                    // console.log(oMovieData);

                    if (oMovieData.Response === undefined) {
                        oMovieData = JSON.parse(oMovieData);
                    }

                    var sMovieName = oMovieData.Title;
                    $("#spanMoviesMovieDataPlot").html(oMovieData.Plot);
                    $("#spanMoviesMovieDataActors").html(oMovieData.Actors);
                    $("#spanMoviesMovieDataDirector").html(oMovieData.Director);
                    $("#spanMoviesMovieDataWriter").html(oMovieData.Writer);
                    $("#spanMoviesMovieDataAwards").html(oMovieData.Awards);
                    $("#spanMoviesMovieDataLanguage").html(oMovieData.Language);
                    $("#spanMoviesMovieDataGenre").html(oMovieData.Genre);
                    $("#spanMoviesMovieDataRuntime").html(oMovieData.Runtime);

                    var sSearchYouTube = sMovieName + " " + oMovieData.Year;

                    // We make a YouTube Request for data relevant to the movie
                    var YouTubeRequest = gapi.client.youtube.search.list({
                        q: sSearchYouTube,
                        part: 'snippet',
                        maxResults: 4
                    });

                    YouTubeRequest.execute(function (oYouTubeResults) {
                        renderYouTubeResults(oYouTubeResults, "divContainerMoviesMovieYouTubeResults", sSearchYouTube);
                    });

                    showMovieData();
                }
            });
        },
        data: oMovies.Search
    });
    showMovieSearchData();
});

$(document).bind("OMDBAPIClient::SearchMovies::KO", function () {
    alert("No movies found with that search criteria");
    return false;
});
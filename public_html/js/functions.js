function showSeriesMainContainer() {    
    $("#SeriesContainer").show();
    $("#MoviesContainer").hide();
    $("#ConfigContainer").hide();
}

function showMoviesMainContainer() {
    $("#SeriesContainer").hide();
    $("#MoviesContainer").show();
    $("#ConfigContainer").hide();
}

function showConfigMainContainer() {
    $("#SeriesContainer").hide();
    $("#MoviesContainer").hide();
    $("#ConfigContainer").show();
}


function hideEpisodeData() {
    $("#SeriesDatagridContainer").html("");
    $("#txtEpisodePlot").html("");
    $("#divYouTubeResults").html("");
    $("#divSeriesTitle").html("");
    $("#divSeriesDataIMDB").hide();
    $("#divEpisodeOwnReview").hide();
}

function hideMovieData() {
    $("#divContainerMoviesSearchResults").hide();
    $("#divContainerMoviesMovieData").hide();
    $("#divContainerMoviesMovieOwnReview").hide();
    $("#divContainerMoviesMovieYouTubeResults").hide();
}

function showMovieData() {
    $("#divContainerMoviesSearchResults").show();
    $("#divContainerMoviesMovieData").show();
    $("#divContainerMoviesMovieOwnReview").show();
    $("#divContainerMoviesMovieYouTubeResults").show();
}

function renderYouTubePagination(iPage, iMax) {
    var sHTML = "<ul class='pagination'>";
    for (var i = iPage; i < iMax; i++) {
        sHTML += "<li class='"
        if (i === iPage) {
            sHTML += "active";
        }
        sHTML += "'><a href='#'>" + i + "</a>";
    }
    sHTML += "</ul>";
    return sHTML;
}

function renderYouTubeResults(oResults, sDivRender) {
    console.log("renderYouTubeResults");
    console.log(oResults);
    var sHTML = "<H4>YOUTUBE RELATED VIDEOS</H4>";
    var iCount = 0;
    for (var i = 0; i < oResults.items.length; i++) {
        if (i % 2 === 0) {
            sHTML += "<div class='row small'>";
            iCount = 0;
        }
        sHTML += "<div class='col-sm-6'>";
        sHTML += "<b>Title: " + oResults.items[i].snippet.title + "</b><br />";
        sHTML += "<iframe id='ytplayer_" + i + "' type='text/html' width='320' height='200' src='http://www.youtube.com/embed/" + oResults.items[i].id.videoId + "' frameborder='0'></iframe><br />";
        sHTML += "</div>";
        iCount++;
        if (iCount === 2) {
            sHTML += "</div>";
        }
    }
    
    $("#" + sDivRender).html(sHTML);

}

function renderSeasonTabsAndCaptions(iSeasons) {
    var sHTMLCaption = "<div class='container'><ul class='nav nav-tabs' role='tablist'>";
    var sHTMLContentPanels = "<div class='tab-content'>";

    // Create tabs-clickable captions
    for (var i = 0; i < iSeasons; i++) {
        var sNameGrid = "Grid_" + i;
        sHTMLCaption += "<li role='presentation' class='";
        sHTMLCaption += (i === 0) ? "active" : "";

        sHTMLCaption += "'><a href='#Temporada_" + (i + 1) + "' aria-controls='Temporada_" + (i + 1) + "' data-toggle='tab'>Temporada " + (i + 1) + "</a></li>";
        // Create tabs content
        sHTMLContentPanels += "<div id='Temporada_" + (i + 1) + "' role='tabpanel' class='tab-pane";
        sHTMLContentPanels += (i === 0) ? " active" : "";
        sHTMLContentPanels += "'>";
        sHTMLContentPanels += "<div id='" + sNameGrid + "'></div>";
        sHTMLContentPanels += "</div>";
    }
    sHTMLCaption += "</ul>";
    sHTMLContentPanels += "</div></div>";
    var sFinalHTML = sHTMLCaption + sHTMLContentPanels;
    $("#SeriesDatagridContainer").html(sFinalHTML);
}

function gridOnClickRowHandler(oEpisode) {
    oSelectedEpisode = oEpisode;
    if (oEpisode.iIMDBID === 0) {
        return false;
    }
    $("#divSeriesDataIMDB").show();
    $("#divEpisodeOwnReview").show();
    if (oEpisode.sPlot !== "") {
        $("#spanEpisodePlot").html(oEpisode.sPlot);
    }
    if (oEpisode.aActors.length > 0) {
        $("#spanEpisodeActors").html(oEpisode.aActors.join(", "));
    }

    $("#txtOwnReview").val(oEpisode.sPersonalReview);

    // Youtube stuff now... :-D
    //@TODO: YouTube PageToken
    var sReq = oEpisode.sSeriesName + " " + oEpisode.sTitle;
    var request = gapi.client.youtube.search.list({
        q: sReq,
        part: 'snippet',
        maxResults: 4
    });
    
    request.execute(function (oYouTubeData) {
        renderYouTubeResults(oYouTubeData, "divYouTubeResults");
    });
    
    // request.execute.apply(renderYouTubeResults, "divYouTubeResults");
    
    document.getElementById("aLinkImage").href = oEpisode.sPosterURL;
    document.getElementById("imgEpisodeImage").src = oEpisode.sPosterURL;
}

function renderGrids(iSeasons) {
    for (var i = 0; i < iSeasons; i++) {
        var sNameGrid = "Grid_" + i;
        $("#" + sNameGrid).bootstrapTable({
            sortable: true,
            maintainSelected: true,
            classes: 'table table-hover table-condensed',            
            columns: [
                {field: 'iEpisodeInSeason', title: 'Episodio', formatter: function (value) {
                        return value + 1;
                    }, sortable: true},
                {field: 'sTitle', title: 'Título', sortable: true},
                {field: 'fIMDBRating', title: 'Valoración IMDB', sortable: true},
                {field: 'fRuntime', title: 'Duración'},
                {field: 'iYear', title: 'Año', sortable: true},
                {field: 'iPersonalRating', title: 'Puntuación', sortable: true},
                {field: 'iIMDBVotes', title: 'Votos IMDB', sortable: true},
                {field: 'sReleaseDate', title: 'Estrenado'},
                {field: 'bIsFavorite', title: '¿Favorito?', sortable: true},
                {field: 'sPersonalReview', visible: false}
            ],
            data: oClient.oLastScannedSeries.Seasons[i].Episodes,
            onClickRow: gridOnClickRowHandler
        });
    }
}
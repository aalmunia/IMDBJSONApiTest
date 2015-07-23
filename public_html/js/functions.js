function showMainContainer(iContainer) {
    for (var i = 0; i < 3; i++) {
        var sIDDiv = "MainContainer_" + i;
        var sIDLink = "MainContainerLI_" + i;
        $("#" + sIDLink).removeClass("active");
        if (parseInt(iContainer) === i) {
            $("#" + sIDDiv).show();
            $("#" + sIDLink).addClass("active");
        } else {
            $("#" + sIDDiv).hide();
        }
    }
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

function showMovieSearchData() {
    $("#divContainerMoviesSearchResults").show();
}

function showMovieData() {
    $("#divContainerMoviesMovieData").show();
    $("#divContainerMoviesMovieOwnReview").show();
    $("#divContainerMoviesMovieYouTubeResults").show();
}

function makeYouTubePaginationRequest(sPageToken, sSearchTerm, sDivRender) {
    var oRequest = gapi.client.youtube.search.list({
        q: sSearchTerm,
        part: 'snippet',
        maxResults: 4,
        pageToken: sPageToken
    });
    oRequest.execute(function (oYouTubeData) {
        console.log(oYouTubeData);
        renderYouTubeResults(oYouTubeData, sDivRender, sSearchTerm);
    });
}

function renderYouTubePagination(oPageToken, sSearchTerm, sDivRender) {
    var sHTML = "<ul class='pagination'>";
    if (oPageToken.sPagePrev !== "") {
        sHTML += "<li>";
        sHTML += "<a href=\"javascript:makeYouTubePaginationRequest('" + oPageToken.sPagePrev + "', '" + sSearchTerm.replace('\'', '') + "', '" + sDivRender + "');\"><img src='img/left_arrow.png' width='50' height='50' /></a>";
        sHTML += "</li>";
    }
    if (oPageToken.sPageNext !== "") {
        sHTML += "<li>";
        sHTML += "<a href=\"javascript:makeYouTubePaginationRequest('" + oPageToken.sPageNext + "', '" + sSearchTerm.replace('\'', '') + "', '" + sDivRender + "');\"><img src='img/right_arrow.png' width='50' height='50' /></a>";
        sHTML += "</li>";
    }

    sHTML += "</ul>";
    return sHTML;
}

function renderYouTubeResults(oResults, sDivRender, sSearchTerm) {
    console.log(oResults);
    var iCount = 0;
    var sHTML = "";
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

    var oPageToken = {
        sPageNext: (oResults.nextPageToken !== undefined) ? oResults.nextPageToken : "",
        sPagePrev: (oResults.prevPageToken !== undefined) ? oResults.prevPageToken : ""
    };

    sHTML += renderYouTubePagination(oPageToken, sSearchTerm, sDivRender);
    $("#" + sDivRender).html(sHTML);

}

function renderSeasonTabsAndCaptions(iSeasons) {
    var sHTMLCaption = "<div><ul class='nav nav-tabs' role='tablist'>";
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
    if (oEpisode.sIMDBID === 0) {
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

    var isFav = (oEpisode.bIsFavorite === true) ? true : false;
    console.log(isFav);

    $("#chkMakeFavorite").prop('checked', isFav);
    $("#selRateEpisode").val(oEpisode.iPersonalRating);

    $("#txtOwnReview").val(oEpisode.sPersonalReview);

    // Youtube stuff now... :-D
    //@TODO: YouTube PageToken
    //  + "Season " + oEpisode.iSeason + " Episode " + oEpisode.iEpisodeInSeason;
    var sReq = oEpisode.sSeriesName + " " + oEpisode.sTitle;
    var request = gapi.client.youtube.search.list({
        q: sReq,
        part: 'snippet',
        maxResults: 4
    });

    request.execute(function (oYouTubeData) {
        renderYouTubeResults(oYouTubeData, "divYouTubeResults", sReq);
    });

    $("#divContainerYouTubeResults").show();

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
                {field: 'iEpisodeInSeason', width: '8%', title: 'Ep', formatter: function (value) {
                        return value + 1;
                    }, sortable: true},
                {field: 'sTitle', width: '44%', title: 'Título', sortable: true},
                {field: 'fIMDBRating', width: '8%', title: 'Rating', sortable: true},
                {field: 'fRuntime', title: 'Duración', width: '8%'},
                {field: 'iYear', width: '8%', title: 'Año', sortable: true},
                {field: 'iPersonalRating', width: '8%', title: 'Puntuación', sortable: true, formatter: function (a, b, c) {
                        var sHTML = "";
                        if (b.iPersonalRating > -1) {
                            for (var i = 0; i < b.iPersonalRating; i++) {
                                sHTML += "<img src='img/icon-star.png' />";
                            }
                        }
                        return sHTML;
                    }},
                {field: 'iIMDBVotes', width: '8%', title: 'Votos IMDB', sortable: true},
                /* {field: 'sReleaseDate', width: '8%', title: 'Estrenado'}, */
                {field: 'bIsFavorite', width: '8%', title: '¿Favorito?', sortable: true, formatter: function (a, b, c) {
                        if (b.bIsFavorite === true) {
                            return "<img src='img/favorites-icon.png' />";
                        } else {
                            return "";
                        }
                    }},
                {field: 'sPersonalReview', visible: false},
                {field: 'iEpisodeInSeason', visible: false}
            ],
            data: oClient.oLastScannedSeries.Seasons[i].Episodes,
            onClickRow: gridOnClickRowHandler
        });
    }
}

function i18nTranslate(sID) {
    var aLangTranslate;
    if (sID === undefined || sID === "") {
        aLangTranslate = $("langtranslate");
    } else {
        aLangTranslate = [];
        aLangTranslate[0] = $("langtranslate[id=" + sID + "]");
    }
    for (var i = 0; i < aLangTranslate.length; i++) {
        aLangTranslate[i].innerHTML = gbl_oAppLangStrings[gbl_aAppConfig.sBrowserLanguage][aLangTranslate[i].id];
    }
}

function createNotification(sMessage, iTimeClose) {
    var oNotify = $.notify(sMessage);
    setTimeout(function () {
        oNotify.close();
    }, iTimeClose);
}
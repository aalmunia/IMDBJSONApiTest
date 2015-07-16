<?php

class Episode {    
    private $_sTitle = "";
    private $_iSeason = 0;
    private $_iEpisodeInSeason = 0;
    private $_iEpisodeNumber = 0;
    private $_fIMDBRating = 0;
    private $_iPersonalRating = -1;
    private $_iYear = 0;
    private $_sPlot = "";
    private $_iIMDBID = 0;
    private $_iIMDBVotes = 0;
    private $_aYouTubeAssocID = [];
    private $_aGenres = [];
    private $_aCast = [];
    private $_iSeriesIMDBID = 0;
    private $_sReleaseDate = "";
    private $_sSeriesName = "";
    private $_sPosterURL = "";
    
    public function loadFromJSON($sJSONResponse) {
        $oJSON = json_decode($sJSONResponse);
        echo "<pre>";
        print_r($oJSON);
        echo "</pre>";
    }
}
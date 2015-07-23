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
    private $_sIMDBID = 0;
    private $_iIMDBVotes = 0;
    private $_aYouTubeAssocID = [];
    private $_aGenres = [];
    private $_aCast = [];
    private $_iSeriesIMDBID = 0;
    private $_sReleaseDate = "";
    private $_sSeriesName = "";
    private $_sPosterURL = "";
    
    public function fromArray($aEpisode) {
        $this->_sTitle = $aEpisode["sTitle"];
        $this->_iSeason = $aEpisode["iSeason"];
        $this->_iEpisodeInSeason = $aEpisode["iEpisodeInSeason"];
        $this->_fIMDBRating = $aEpisode["fIMDBRating"];
        $this->_iPersonalRating = $aEpisode["iPersonalRating"];
        $this->_iYear = $aEpisode["iYear"];
        $this->_sPlot = $aEpisode["sPlot"];
        $this->_sIMDBID = $aEpisode["sIMDBID"];
        $this->_iIMDBVotes = $aEpisode["iIMDBVotes"];
        $this->_aCast = $aEpisode["aCast"];
        // $this->_iSeriesIMDB = 
        $this->_sPosterURL = $aEpisode["sPosterURL"];
    }
}
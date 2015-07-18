<?php

define("SEASON_DEFAULT", 1);
define("EPISODE_DEFAULT", 1);
define("SEASONS_SCAN_MAX", 2);
define("EPISODES_SCAN_MAX", 5);

define ("OMDB_API_ROOT", "http://www.omdbapi.com/");

require_once "Episode.php";

class OMDBAPIClient {

    private $_oLastResult;
    private $_oLastSeriesScanned;
    private $_sOMDBAPIRoot;
    private $_iMaxSeasons;
    private $_iMaxEpisodes;

    public function __construct() {
        $this->_oLastResult = null;
        $this->_oLastSeriesScanned = null;
        $this->_sOMDBAPIRoot = OMDB_API_ROOT;
        $this->_iMaxSeasons = SEASONS_SCAN_MAX;
        $this->_iMaxEpisodes = EPISODES_SCAN_MAX;
    }

    private function accessURL($sURL) {
        $curl = curl_init($sURL);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $curl_response = curl_exec($curl);
        
        if ($curl_response === false) {
            $info = curl_getinfo($curl);
            curl_close($curl);
            throw new Exception("Error accessing URL: " . $sURL, $curl_response);            
        }
        curl_close($curl);
        return $curl_response;
    }

    public function getEpisodeBySeriesName($sSeriesName, $iSeason = SEASON_DEFAULT, $iEpisode = EPISODE_DEFAULT) {
        $sFinalURL = $this->_sOMDBAPIRoot . "?t=" . urlencode($sSeriesName) . "&Season=" . $iSeason . "&Episode=" . $iEpisode . "&plot=full";
        $sJSON = $this->accessURL($sFinalURL);
        $oEpisode = new Episode();
        $oEpisode->loadFromJSON($sJSON);
    }

    public function getSeries($sSeriesName) {
        
    }

    public function scanSeries($sSeriesName, $iSeasonsMaxScan = SEASONS_MAX_SCAN, $iEpisodesMaxScan = EPISODES_MAX_SCAN) {
        
    }

}

$oAPITester = new OMDBAPIClient();
$oAPITester->getEpisodeBySeriesName("Game of thrones",2,3);
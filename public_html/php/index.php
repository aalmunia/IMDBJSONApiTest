<?php

error_reporting(E_ALL);

require_once 'silex/vendor/autoload.php';

$app = new Silex\Application();

$sOMDBAPI_BaseURL = "http://www.omdbapi.com/";

$app->get("/", function() {
    return "Hi there from Silex. Remember, my URLS use /index.php/";
});

$app->get("/getMovieByID/{imdbID}/", function($imdbID) use ($app) {
    $sURL = "http://www.omdbapi.com/?i=" . $imdbID;
    $curl = curl_init($sURL);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $curl_response = curl_exec($curl);

    if ($curl_response === false) {
        $info = curl_getinfo($curl);
        curl_close($curl);
        throw new Exception("Error accessing URL: " . $sURL, $curl_response);
    }
    curl_close($curl);
    header("Content-type: application/json; charset=utf-8");
    return $curl_response;
});

$app->get("/searchMovies/{sSearchTerm}/", function($sSearchTerm) use ($app) {
    $sURL = "http://www.omdbapi.com/?s=" . $sSearchTerm . "&type=movie&plot=full";
    
    $curl = curl_init($sURL);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $curl_response = curl_exec($curl);

    if ($curl_response === false) {
        $info = curl_getinfo($curl);
        curl_close($curl);
        throw new Exception("Error accessing URL: " . $sURL, $curl_response);
    }
    curl_close($curl);
    header("Content-type: application/json; charset=utf-8");
    return $curl_response;
    // exit();
});

$app->get("/img/{sName}/{imdbID}/", function($sName, $imdbID) use ($app) {
    // $oDataElem = $app->get("/getMovieByID/".$imdbID);
    echo "<pre>";
    print_r($oDataElem);
    
    /* $sURL = "http://ia.media-imdb.com/images/M/MV5BMTAyNjM0MjUxMTdeQTJeQWpwZ15BbWU4MDI2NjI0ODAx._V1_SX300.jpg";
    file_put_contents("img.jpg", file_get_contents($sURL));
    return true; */
    /* $curl = curl_init($sURL);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $curl_response = curl_exec($curl);

    if ($curl_response === false) {
        $info = curl_getinfo($curl);
        curl_close($curl);
        throw new Exception("Error accessing URL: " . $sURL, $curl_response);
    }
    curl_close($curl);
    header("Content-type: image/jpeg");
    return $curl_response; */
});

$app->run();

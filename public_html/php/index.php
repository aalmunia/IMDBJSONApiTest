<?php

error_reporting(E_ALL);

require_once 'silex/vendor/autoload.php';

$app = new Silex\Application();

$sOMDBAPI_BaseURL = "http://www.omdbapi.com/";

$app->get("/hello", function() {
    return "Hi there from Silex";
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

$app->run();

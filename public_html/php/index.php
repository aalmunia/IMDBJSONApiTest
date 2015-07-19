<?php

error_reporting(E_ALL);

require_once 'silex/vendor/autoload.php';

$app = new Silex\Application();

$app->get("/hello", function() {
    return "Hi there from Silex";
});

$app->get("/t/{imdbID}/", function($imdbID) use ($app) {
    return $app->json(Array("imdbID" => $imdbID));
});

$app->run();
function Episode() {
    this.sTitle = "";
    this.iSeason = 0;
    this.iEpisodeInSeason = 0;
    this.iEpisodeNumber = 0;    //@TODO: Implement, maybe...
    this.fIMDBRating = 0;
    this.iPersonalRating = -1;
    this.bIsFavorite = false;
    this.iYear = 0;
    this.sPlot = "";
    this.sIMDBID = 0;
    this.iIMDBVotes = 0;
    this.aYouTubeAssocID = [];
    this.aGenres = [];
    this.aCast = [];
    this.iSeriesIMDBID = 0;
    this.sReleaseDate = ""; //@TODO: Date format, filter
    this.sSeriesName = "";
    this.sPosterURL = "";
    this.sPersonalReview = "";
};

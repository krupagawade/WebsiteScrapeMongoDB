var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");

// Our scraping tools
// It works on the client and on the server
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/websiteScrapeMongoDB");

// Routes

// A GET route for scraping the NYTimes website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request

//    request("https://www.nytimes.com/", function (error, response, html) {
    axios.get("https://www.nytimes.com/").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        var result = {};

        // Now, we grab every h2 within an article tag, and do the following:
        $("article").each(function (i, element) {
            // Save an empty result object

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("h2").children("a")
                .text();
            result.link = $(this)
                .children("h2").children("a")
                .attr("href");
            result.description = $(this)
                .children("p").filter(".summary")
                .text();

            // If this found element had both a title and a link
            if (result.title && result.link) {
                // Insert the data in the scrapedData db
                db.Article.create({
                    title: result.title,
                    link: result.link,
                    description: result.description
                },
                function (err, inserted) {
                    if (err) {
                        if(err.code === 11000)
                        // Log the error if one is encountered during the query
                            console.log("Found Duplicate");
                        else
                            return res.json(err);
                    }
                });
            } //end of if
        }); //end of each article
        console.log("Getting DATA !!!!!!!!!!!!!!!!");

        //Once all the articles are inserted in MongoDB we do a select from Articles to send to user
        db.Article.find({})
        .then(function(dbArticle){
        res.json(dbArticle);
          console.log("length !!!!!!"+dbArticle.length);
        })
        .catch(function(err){
        res.json(err);
        });
    });
});  //end of get function


//Route for changing the attribute Saved Article as per user selection
app.get("/articles/:id", function(req, res) {
    //var query = { _id = req.params.id};
    
    db.Article.findOneAndUpdate({ _id: req.params.id }, {$set: {saveArticle: true}},function(err, result){
        if(err){
            console.log(err);
        }
        else
            return true;
    });

});//end of get

//Route for getting all the saved articles
app.get("/savedArticles", function(req, res){
    db.Article.find({saveArticle:true})
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
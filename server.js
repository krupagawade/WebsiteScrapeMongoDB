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

var PORT =  process.env.PORT || 3000;

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
//mongoose.connect("mongodb://localhost/websiteScrapeMongoDB");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/websiteScrapeMongoDB";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the NYTimes website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request

    var Articles = new Array();

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

                //var article = ["title": result.title, "link": result.link,"description": result.description];

                var article = {
                        "title": result.title,
                        "link": result.link,
                        "description": result.description
                }    
                Articles.push(article);            
            } //end of if
        }); //end of each article
        res.send(JSON.stringify(Articles));
    });
});  //end of get function


//Route for saving the Article in MongoDB
app.post("/saveArticle/", function(req, res) {

    db.Article.create({
        title: req.body.title,
        link: req.body.link,
        description: req.body.description
    },
    function (err, inserted) {
        if (err) {
            if(err.code === 11000)
            // Log the error if one is encountered during the query
                return res.json("Found Duplicate");
            else
                return res.json(err);
        }
    }); //end of insert
});//end of post

app.post("/saveNotes/", function(req, res){
    var id = req.body.id;
    var notesDetails = req.body.notesDesc;
      // Create a new note and pass the req.body to the entry
    db.Note.create({
        _id : id,
        body : notesDetails
    })  
    .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
    })
    .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
    });

});



//Route for getting all the saved articles
app.get("/savedArticles", function(req, res){
//    db.Article.find({saveArticle:true})
    db.Article.find({})
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

//Route to get all the notes saved for a article
app.get("/notes/:id", function(req, res){

    db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });

})

//delete notes 
app.get("/deleteNote/:id", function(req, res){

    db.Note.findOneAndRemove(
        {"_id": req.params.id}, function(err){
            if(err)
                res.send(err);
        }
    );

     db.Article.findOneAndUpdate(
         {"_id": req.params.id},
         {$pull: {"note": req.params.id}})
         .exec(function(err) {
            // Log any errors
            if (err) {
              res.send(err);
            }
            else {
              // Or send the note to the browser
              res.send("Note Deleted");
            }
        }
    ); //end of article Note field delete


});//end of delete note

//Delete Article
app.get("/deleteArticle/:id", function(req, res){

    db.Note.findOneAndRemove(
        {"_id": req.params.id}, function(err){
            if(err)
                res.send(err);
            else{
                db.Article.findOneAndRemove(
                    {"_id": req.params.id}, function(err){
                        if(err)
                            res.send(err);
                        else
                            res.send("Article deleted");
                    }
                );
            }
        }   
    );

});//end of delete note



// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
}); 
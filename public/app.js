// $("#scrape").on("click", getScrappedArticles);
// $("#savedArticles").on("click", gotoSavedArticles);
// $("#savedArticles1").on("click", gotoSavedArticles);

var articleData = "";

function getScrappedArticles(){

    $.getJSON("/scrape", function(data) {

        //Save the scraped article data for "Saved Article"
        articleData = data;
        $("#articles").empty();
        // For each one
        for (var i = 0; i < data.length; i++) {
        var buttonName = "";
        
        if(data[i].saveArticle){
            buttonName = "Saved for Reading";
        }
        else{
            buttonName = "Save the Article";
        }

        // Display the apropos information on the page
        var newDiv = '<div class="panel panel-info">' +
        '<h4 class= "panel-title" data-id=' + data[i]._id + '> <a href="' + data[i].link + '">' + data[i].title + '</a>' +
        '<div class="panel-body">' + data[i].description + '</div>'  +     
        '<button type="button" class="saveArticle btn btn-success" id="' + i + '" onclick=saveArticle("' + i + '")>'+ buttonName + '</button>'
        '</div><br>'
        $("#articles").append(newDiv);    
        }
    });
}

function saveArticle(val){

    console.log(articleData.length +"val" +  val );
    console.log(articleData[parseInt(val)]);

    // Now make an ajax call to save the Article
    $.ajax({
    method: "post",
    url: "/saveArticle/",
    data: articleData[parseInt(val)],
    dataType: "json"
    })
    // With that done, add the note information to the page
    .then(function(data) {
        console.log(data);
    });
    //change the button text to saved
    $(val).text("Saved");
};


function gotoSavedArticles(){
    window.location.href = "./saved.html";
}

function goHome(){
    window.location.href = "./index.html";

}

//called by the body onload of saved.html
function getSavedArticles(){
    console.log("getting articles");
        $.getJSON("/savedArticles", function(data) {
            var bodyDiv = $("#articles");
        console.log("Got data" + data.length);
        for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
    
        var newDiv = '<div class="panel panel-info">' +
        '<h4 class= "panel-title" data-id=' + data[i]._id + '> <a href="' + data[i].link + '">' + data[i].title + '</a>' +
        '<div class="panel-body">' + data[i].description + '</div>'  +     
        '<button type="button" class="saveArticle btn btn-primary" onclick=deleteArticle("' + data[i]._id + '")>Delete Article</button>' +
        ' <button type="button" class="saveNote btn btn-primary" data-toggle="modal" data-target="#notesModal" data-whatever="' + data[i]._id + '" onclick=getID("' + data[i]._id + '")>Add Notes</button>'
        '</div>'
        $("#articles").append(newDiv);    
        //$("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
        }
    });

}

function getID(val){
    console.log(val);
    $("#article_id").val(val);
    $("#article_notes").val("");
    getNotes(val);
}

function saveNotes(){
    // Now make an ajax call to save the Article
    var notesDetails = {
        id: $("#article_id").val(), 
        notesDesc: $("#article_notes").val()
    };
   console.log('notes', notesDetails);
   
    $.ajax({
        method: "post",
        url: "/saveNotes/",
        data: notesDetails,
    })
    .then(function(data) {
        $("#article_notes").val("");
        getNotes(notesDetails.id);
    });
}

//getting saved notes from database
function getNotes(id){
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/notes/" + id
  })
    // With that done, add the note information to the page
    .then(function(data) {
        //console.log(data);
        var label_notes = $("<label id='label_notes'>");
        label_notes.text(data.note[0].body);
        var button_deleteNote = $("<button id='button_deleteNote' type='button' class='close' aria-label='Close' onclick=deleteNote('"+id+"')><span aria-hidden='true'>&times;</span></button>");
        $("#existingNotes").append(label_notes);
        $("#existingNotes").append(button_deleteNote);
    });
}

//delete note for a article
function deleteNote(id){
    $.ajax({
        type: "GET",
        url: "/deleteNote/" + id
        }).
        then(function(response) {
            $("#label_notes").remove();
            $("#button_deleteNote").remove();
        });
}

function deleteArticle(id){
    $.ajax({
        type: "GET",
        url: "/deleteArticle/" + id,
        // On successful call
        success: function(response) {
            $("#articles").empty();
            console.log("Refresh");
            getSavedArticles();
        }
    });
}


//document ready
$(function() {
   // console.log("document load");
    $("#header").load("nav.html"); 

});
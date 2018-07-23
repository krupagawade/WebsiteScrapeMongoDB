$("#scrape").on("click", getScrappedArticles);
$("#savedArticles").on("click", gotoSavedArticles);

$("#savedArticles1").on("click", gotoSavedArticles);

function getScrappedArticles(){
    console.log("Inside scrapped Articles");
    $.getJSON("/scrape", function(data) {
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
        '<button type="button" class="saveArticle btn btn-success" onclick=saveArticle("' + data[i]._id + '")>'+ buttonName + '</button>'
        '</div><br>'
        $("#articles").append(newDiv);    
        //$("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
        }
    });
}

function saveArticle(val){

    console.log(val);

    // Now make an ajax call for the Article
    $.ajax({
    method: "GET",
    url: "/articles/" + val
    })
    // With that done, add the note information to the page
    .then(function(data) {
        console.log(data);
    });
};


function gotoSavedArticles(){
    window.location.href = "./saved.html";
}

function goHome(){
    window.location.href = "./index.html";

}

//called by the body onload of saved.html
function getSavedArticles(){
    $.getJSON("/savedArticles", function(data) {
        // For each one
        // var bodyEle = $(document.body);
        // var bodyDiv = '<div id="articles">';
        // bodyEle.append(bodyDiv);
      //  bodyDiv.appendTo($(document.body));
        var bodyDiv = $("#articles");

        for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
    
        var newDiv = '<div class="panel panel-info">' +
        '<h4 class= "panel-title" data-id=' + data[i]._id + '> <a href="' + data[i].link + '">' + data[i].title + '</a>' +
        '<div class="panel-body">' + data[i].description + '</div>'  +     
        '<button type="button" class="saveArticle btn btn-primary" onclick=saveArticle("' + data[i]._id + '")>Saved Article</button>'
        '</div>'
        $("#articles").append(newDiv);    
        //$("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
        }
    });

}


//document ready
$(function() {
   // console.log("document load");
    $("#header").load("nav.html"); 

});
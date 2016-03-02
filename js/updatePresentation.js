$( document ).ready(function() {

  var template = "";
  var nbStep = 1;
  $(".list-group").empty();
  var presentation = "";

  /**
  * Rend la liste ordonnable
  **/
  $( ".list-group" ).sortable({
    stop: function( event, ui ) {
      nbStep = 1;
      $(".list-group-item-heading").each(function( index ) {
        $(this).html("Chapitre " + nbStep);
        nbStep++;
      });
    }
  });
  $( ".list-group" ).disableSelection();

  /**
  * Genere la liste
  **/
  $.ajax({
    type: "GET",
    url: "/partial/stepUpdate",
    success: function(html){
    template = html;
      $.ajax({
        type: "GET",
        url: "/data.json",
        success: function(json){
          // valeurs global
          $("#mainTitle").val(json.presentation[$.urlParam("id")].title);
          $("#mainHour").val(json.presentation[$.urlParam("id")].time.split(":")[0]);
          $("#mainMinute").val(json.presentation[$.urlParam("id")].time.split(":")[1]);
          var rendered = "";
          for (i in json.presentation[$.urlParam("id")].step){
            // pour chaque chapitre
            var step = json.presentation[$.urlParam("id")].step[i];
            rendered += Mustache.render( template, {title: step.title, h: step.h, m: step.m, nbStep: nbStep});
            nbStep++;
          }
          $(".list-group").html(rendered);
        }
      });
    }
  });

  /**
  * Recupération des parametres de l'url
  **/
  $.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){return null;}
    else{return results[1] || 0;}
  }

  /**
  * Ajout d'un chapitre
  **/
  $("#addStep").click(function(){
    $(".list-group").append(Mustache.render( template, {nbStep: nbStep}));
    nbStep++;
  });

  /**
  * Sauvegarde de la presentation
  **/
  $("#save").click(function(){
    presentation = new Object();
    presentation.title = $("#mainTitle").val();
    presentation.time= ("0" + $("#mainHour").val()).slice(-2) + ":" + ("0" + $("#mainMinute").val()).slice(-2) + ":00";
    presentation.step = new Array();
    $(".list-group-item").each(function( index ) {
      var title = $(this).children(".title").val();
      var hour = $(this).children(".hour").val();
      var minute = $(this).children(".minute").val();
      var step = {title: title, h: ("0" + hour).slice(-2), m: ("0" + minute).slice(-2), s: "00"};
      presentation.step.push(step);
    });
    $.ajax({
      type: "POST",
      url: "/updatePresentation",
      data: {presentation: presentation, id: $.urlParam("id")},
      success: function(data){
        if(data){
          window.location.href = "/listPresentation";
        }else{
          alert("Une erreur c'est produite.");
        }
      }
    });
  });

  /**
  * Suppression d'un chapitre
  **/
  $(".list-group").on( "click", ".supprimer", function() {
    $(this).parent(".list-group-item").remove();
    nbStep = 1;
    //on reordonne tout les chapitres
    $(".list-group-item-heading").each(function( index ) {
      $(this).html("Chapitre " + nbStep);
      nbStep++;
    });
  });

  /**
  * survole des chapitre
  **/
  $(".list-group")
  .on("mouseenter", ".list-group-item", function() {
    $( this ).addClass("active");
  })
  .on("mouseleave", ".list-group-item", function() {
    $( this ).removeClass("active");
  });
});

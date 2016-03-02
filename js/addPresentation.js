$( document ).ready(function() {

  //Enregistrement du modele de chapitre
  var template = "";
  var nbStep = 1;
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
  * Rendu du premier chapitre
  **/
  $.ajax({
    type: "GET",
    url: "/partial/stepUpdate",
    success: function(html){
      template = html;
      $(".list-group").html(Mustache.render( template, {nbStep: nbStep}));
      nbStep++;
    }
  });

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
      url: "/addPresentation",
      data: {presentation: presentation},
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
  * survole des chapitres
  **/
  $(".list-group")
  .on("mouseenter", ".list-group-item", function() {
    $( this ).addClass("active");
  })
  .on("mouseleave", ".list-group-item", function() {
    $( this ).removeClass("active");
  });
});

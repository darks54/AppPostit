$( document ).ready(function() {

  var data = "";
  $(".list-group").empty();

  /**
  * Genere la liste
  **/
  $.ajax({
    type: "GET",
    url: "/partial/presentationUpdate",
    success: function(html){
      $.ajax({
        type: "GET",
        url: "/data.json",
        success: function(json){
          data = json;
          var rendered = "";
          for (i in data.presentation){  //generation de la liste
            var presentation = data.presentation[i];
            rendered += Mustache.render( html, {title: presentation.title, time: presentation.time, id: i});
          }
          $(".list-group").html(rendered);
        }
      });
    }
  });

  $(".list-group").on( "click", ".modifier", function() {
      window.location.href = "/updatePresentation?id=" + $(this).parent(".list-group-item").attr("id");
  });

  /**
  * Suppression d'une presentation
  **/
  $(".list-group").on( "click", ".supprimer", function() {
    if (confirm("Confirmer la suppression.") == true) {
      $.ajax({
        type: "POST",
        url: "/listUpdatePresentation",
        data: {id: $(this).parent(".list-group-item").attr('id')},
        success: function(data){
          if(data){
          }else{
            alert("Une erreur c'est produite.");
          }
        }
      });
      $(this).parent(".list-group-item").remove();
      $(".list-group-item").each(function( index ) {
        $(this).attr("id", index);
      });
    }
  });

  /**
  * survole des presentation
  **/
  $(".list-group")
  .on("mouseenter", ".list-group-item", function() {
    $( this ).addClass("active");
  })
  .on("mouseleave", ".list-group-item", function() {
    $( this ).removeClass("active");
  });
});

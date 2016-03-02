$( document ).ready(function() {

  var data = "";
  $(".list-group").empty();

  /**
  * Genere la liste
  **/
  $.ajax({
    type: "GET",
    url: "/partial/presentation",
    success: function(html){
      $.ajax({
        type: "GET",
        url: "/data.json",
        success: function(json){
          data = json;
          var rendered = "";
          for (i in data.presentation){  //generation de la liste
            var presentation = data.presentation[i];
            rendered += Mustache.render( html, {title: presentation.title, time: presentation.time, lien: "/presentation?id=" + i});
          }
          $(".list-group").html(rendered);
        }
      });
    }
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

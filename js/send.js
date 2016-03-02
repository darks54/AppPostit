(function($){

  var socket = io.connect(/*lien*/);
  var msgtpl= false;
  var lastmsg = false;

  $( "#post_it" ).click(function() {
    $( "#message" ).focus();
  });

  $( document ).on( "vmouseup", "#post_it", function() {
    $( "#message" ).focus();
  });

  var droped = false;

  /**
  * Gestion drag
  **/
  $('#post_it').draggable({
    axis: 'y',
    stop: function( event, ui ) {
      if(!droped){
        $('#post_it').removeAttr("style");
      }
    },
    revert: function(event){
      if(!droped){
        return true;
      }else{
        return false;
      }
    },
    cancel: "message"
  });

  /**
  * Gestion drop
  **/
  $( "#drop-target" ).droppable({
    drop: function( event, ui ) {
      droped = true;
      $('#post_it').animate({ "top": "-=256px" }, "fast" );
      setTimeout(function(){
        /**
        * Envois de message
        **/
        socket.emit('newmsg', {message: $('#message').val(), user: $('#username').val()});
        $("#message").val('');
        $('#post_it').removeAttr("style");
        $('#message').focus();
        setTimeout(function(){
          droped = false;
        }, 1000);
      }, 1000);
    },
    tolerance: "touch"
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
  * Gestion connexion
  **/
  var position = $('#post_it').position();

  var lastmsg = false;

  $('#msgtpl').remove();

  $('#loginform').submit(function(event){
    event.preventDefault();
    socket.emit('login', {
      // username : $('#username').val(),
      room: $.urlParam("room")
    })
  });

  socket.on('logged', function(){
    $('#login').fadeOut();
    $('#message').focus();
  });
})(jQuery);

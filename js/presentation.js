$( document ).ready(function() {
  /**
  * Variable
  **/
  var data = "";
  var countdown = "";
  var timer = "";
  var first = true;
  var step = 0;
  var template = "{{h}} : {{m}} : {{s}}";
  Mustache.parse(template);   // enregistre le template pour reutilisation
  var valueTimer = {seconds: 0, minutes: 0, hours: 0};
  var valueCountdown = {seconds: 0, minutes: 0, hours: 0, warningVal: 0};
  var $t = $('#timer');
  var room = "";
  var scrollVal = 0;
  var state = {title: "", h:0, m:0, s:0,steps:[]};

  /**
  * Génération de l'id de la salle
  **/
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 5; i++ ){
    room += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  /**
  * Generation du QrCode
  **/
  var qrcode = new QRCode("qrcode", {
    text: lien + "?room=" + room,
    width: 256,
    height: 256,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
  var qrcode2 = new QRCode("modal-body", {
    text: lien + "?room=" + room,
    width: $(window).height()-100,
    height: $(window).height()-100,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });

  /**
  * Suppression des post-it
  **/
  $("#tableau").on( "click", ".supprimer", function() {
    $(this).parent(".post_it").remove();
  });

  /**
  * Suppression de tous les post-its
  **/
  $("#corbeille").on( "click", function() {
    if (confirm("Confirmer la suppression de tous vos post-it.") == true) {
      $(".post_it").each(function(index){
        $(this).animate({ "top": "-=" + $(window).height() + "px" }, "fast" , function(){
          $(this).remove();
        });
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
  * Gestion des vues partiels
  **/
  $.ajax({
    type: "GET",
    url: "/partial/stepPresentation",
    success: function(html){
      $.ajax({
        type: "GET",
        url: "/data.json",
        success: function(json){
          data = json;
          var rendered = "";
          $('#global h2').html(data.presentation[$.urlParam('id')].title);
          var titleHeight = $("#global").height(); //recuperation du titre
          $("#steps").css("height", "calc(100% - " + titleHeight + "px)"); //calcule de la taille de la zone de la liste
          for (i in data.presentation[$.urlParam('id')].step){  //generation de la liste
            var stepData = data.presentation[$.urlParam('id')].step[i];
            rendered += Mustache.render( html, {title: stepData.title, h: stepData.h, m: stepData.m, s: stepData.s});
            if(i == data.presentation[$.urlParam('id')].step.length - 1){
              $('#steps').html(rendered);
            }
          }

          $.ajax({
            type: "POST",
            url: "/loadState",
            data:{title: data.presentation[$.urlParam('id')].title},
            success: function(json){
              if(json != false){
                valueTimer = {seconds: parseInt(json.s), minutes: parseInt(json.m), hours: parseInt(json.h)};
                $("#timer").html(Mustache.render(template, {h: ("0" + valueTimer.hours).slice(-2), m: ("0" + valueTimer.minutes).slice(-2), s: ("0" + valueTimer.seconds).slice(-2)}))
                for ( index in json.steps){
                  var item = $(".list-group-item")[ parseInt(index) ];
                  $(".list-group").find( item ).replaceWith(Mustache.render( html, {title: json.steps[index].title, h: json.steps[index].h, m: json.steps[index].m, s: json.steps[index].s}));
                  item = $(".list-group-item")[ parseInt(index) ];
                  $(".list-group").find( item ).addClass(json.steps[index].state);
                  step = parseInt(index) + 1;
                }
                state = json;
              }
            }
          });
        }
      });
    }
  });

  /**
  * Gestion des comptes a rebours et du timer
  **/
  $("#go").on( "click", function() {
    /**
    * Gestion du timer
    **/
    if(first){
      timer = setInterval(function(){
        Timer(valueTimer);
        Mustache.parse(template);   // optional, speeds up future uses
        // var rendered = Mustache.render(template, {h: ("0" + valueTimer.hours).slice(-2), m: ("0" + valueTimer.minutes).slice(-2), s: ("0" + valueTimer.seconds).slice(-2)});
        $('#timer').html(Mustache.render(template, {h: ("0" + valueTimer.hours).slice(-2), m: ("0" + valueTimer.minutes).slice(-2), s: ("0" + valueTimer.seconds).slice(-2)}));
      }, 1000);
    }
    /**
    * Gestion des comptes a rebours
    **/
    var stateStep = "";
    var len = $('.countdown').length;
    $(".countdown").each(function(index){

      if(step == index){
        //suppression du countdown si celui existe deja
        if(countdown){
          clearInterval(countdown);
          $t.parent(".list-group-item").removeClass("active");
        }

        //enregistrement des etapes
        if( step > 0 && !first){
          if($t.parent(".list-group-item").hasClass("success")){
            stateStep = "success";
          }else if($t.parent(".list-group-item").hasClass("warning")){
            stateStep = "warning";
          }else{
            stateStep = "danger";
          }
          state.title = data.presentation[$.urlParam('id')].title;
          state.h = ("0" + valueTimer.hours).slice(-2);
          state.m = ("0" + valueTimer.minutes).slice(-2);
          state.s = ("0" + valueTimer.seconds).slice(-2);
          state.steps.push({title: data.presentation[$.urlParam('id')].step[step - 1].title, state: stateStep, h: ("0" + valueCountdown.hours).slice(-2), m: ("0" + valueCountdown.minutes).slice(-2), s: ("0" + valueCountdown.seconds).slice(-2)});
          //envoi de la sauvegarde
          $.ajax({
            type: "POST",
            url: "/saveState",
            data: state,
            success: function(html){}
          });
        }

        var time = data.presentation[$.urlParam('id')].step[step];
        var warningVal = ((parseInt(time.h) * 60 + parseInt(time.m)) * 60 + parseInt(time.s)) * 0.1;
        valueCountdown = {seconds: time.s, minutes: time.m, hours: time.h, warningVal: warningVal}; //mise en place des valeur initiale du countdown
        $t = $(this);
        $t.parent(".list-group-item").addClass("active success");
        $('#steps').animate({scrollTop: scrollVal + 'px'}, 'fast');
        scrollVal += $t.parent(".list-group-item").outerHeight();
        countdown = setInterval(function(){ //lancement du nouveau countdown
          Countdown();
          var rendered = Mustache.render(template, {h: ("0" + valueCountdown.hours).slice(-2), m: ("0" + valueCountdown.minutes).slice(-2), s: ("0" + valueCountdown.seconds).slice(-2)});
          $t.html(rendered);
        }, 1000);
      }
    });
    //si dernier chapitre
    if(step == len){
      clearInterval(countdown);
      clearInterval(timer);
      $t.parent(".list-group-item").removeClass("active");
      // supprimer la sauvegarde
      $.ajax({
        type: "POST",
        url: "/removeState",
        data: {title: data.presentation[$.urlParam('id')].title},
        success: function(html){}
      });
    }

    first = false;
    step++;
  });

  function Countdown(){
    if (valueCountdown.seconds == 0){
      valueCountdown.seconds = 59;
      if (valueCountdown.minutes == 0){
        valueCountdown.minutes = 59;
        if (valueCountdown.hours == 0){
          clearInterval(countdown);
          valueCountdown.seconds = 0;
          valueCountdown.minutes = 0;
          countdown = setInterval(function(){ //si on arrive a 0 on lance le timer dans le rouge
            Timer(valueCountdown);
            var rendered = Mustache.render(template, {h: ("0" + valueCountdown.hours).slice(-2), m: ("0" + valueCountdown.minutes).slice(-2), s: ("0" + valueCountdown.seconds).slice(-2)});
            $t.parent(".list-group-item").removeClass("warning");
            $t.parent(".list-group-item").addClass("danger");
            $t.html(rendered);
          }, 1000);
        }else{
          valueCountdown.hours -= 1;
        }
      }else{
        valueCountdown.minutes -= 1;
      }
    }else{
      valueCountdown.seconds -= 1;
    }
    var valInSeconds = ((valueCountdown.hours*60 + valueCountdown.minutes)*60 + valueCountdown.seconds);
    if(valInSeconds <= valueCountdown.warningVal){
      $t.parent(".list-group-item").removeClass("success");
      $t.parent(".list-group-item").addClass("warning");
    }
  }

  function Timer(obj) {
    obj.seconds += 1;
    if (obj.seconds == 60){
      obj.seconds = 0;
      obj.minutes += 1;
    }
    if (obj.minutes == 60){
      obj.minutes = 0;
      obj.hours += 1;
    }
  }

  /**
  * Gestion des socket
  **/
  var socket = io.connect();
  var msgtpl= false;
  $.ajax({
    type: "GET",
    url: "/partial/postit",
    success: function(msg){
      msgtpl= msg;
    }
  });

  // Création de la salle
  socket.emit('createRoom', {room: room});

  /**
  * Reception d'un message
  **/
  socket.on('newmsg', function(message){
    $('#tableau').append(Mustache.render(msgtpl, message));
    var zindex = 0;
    $(".post_it").each(function(index){
      if($(this).css("z-index") > zindex){
        zindex = $(this).css("z-index");
      }
    });
    $( ".post_it" ).last().draggable({
      scroll: false,
      containment: "parent",
      stack: ".post_it"
    });
    $( ".post_it" ).last().css("z-index", parseInt(zindex) + 1);
    var top = Math.random() * $(window).height() - 256;
    var left = Math.random() * $("#tableau").width() - 256;
    if(top < 0 )
      top += 256;
    if(left < 0 )
      left += 256;
    top += $(window).height();
    top += "px";
    left += "px";
    $( ".post_it" ).last().css( "position", "absolute" ).css( "top", top).css( "left", left );
    $('.post_it').last().animate({ "top": "-=" + $(window).height() + "px" }, "fast" );
  });
});

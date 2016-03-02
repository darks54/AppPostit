var app = require('express.io')();
var fs = require('fs');
var os = require('os');
var mu = require('mustache');
var bodyParser = require('body-parser')

var add = "";
// for (i in os.networkInterfaces().en0){
  // if(os.networkInterfaces().en0[i].family == "IPv4"){
    // add = os.networkInterfaces().en0[i].address;
  // }
// }
for (i in os.networkInterfaces()["Wi-Fi"]){
  if(os.networkInterfaces()["Wi-Fi"][i].family == "IPv4"){
    add = os.networkInterfaces()["Wi-Fi"][i].address;
  }
}

app.use(bodyParser.urlencoded({
  extended: true
}));
app.http().io();

var presentations = {};

/**
* HTML
**/
app.get('/', function (req, res) {
  var stream = mu.render(file('/views/send.html'), {lien: add + ':8080/'});
  res.send(stream);
});

app.get('/presentation', function (req, res) {
  var stream = mu.render(file('/views/presentation.html'), {lien: add + ':8080/'});
  res.send(stream);
});

app.get('/listPresentation', function (req, res) {
  var stream = mu.render(file('/views/listPresentation.html'), {title: "Vos conférences", js: "listPresentation", header: fs.readFileSync(__dirname + '/views/partial/header.html', "utf8")});
  res.send(stream);
});

app.get('/listUpdatePresentation', function (req, res) {
  var stream = mu.render(file('/views/listPresentation.html'), {title: "Sélectionner une conférences", js: "listUpdatePresentation", header: fs.readFileSync(__dirname + '/views/partial/header.html', "utf8")});
  res.send(stream);
});

app.post('/listUpdatePresentation', function (req, res) {
  var file = fs.readFileSync(__dirname + '/data.json', "utf8");
  var json = JSON.parse(file);
  json.presentation.splice(req.body.id, 1);
  saveDataFile(json, res);
});

app.get('/addPresentation', function (req, res) {
  var stream = mu.render(file('/views/addPresentation.html'), {title: "Créer une conférences", js: "addPresentation", header: fs.readFileSync(__dirname + '/views/partial/header.html', "utf8")});
  res.send(stream);
});

app.post('/addPresentation', function (req, res) {
  var file = fs.readFileSync(__dirname + '/data.json', "utf8");
  var json = JSON.parse(file);
  json.presentation.push(req.body.presentation);
  saveDataFile(json, res);
});

app.get('/updatePresentation', function (req, res) {
  var stream = mu.render(file('/views/addPresentation.html'), {title: "Modifier votre conférences", js: "updatePresentation", header: fs.readFileSync(__dirname + '/views/partial/header.html', "utf8")});
  res.send(stream);
});

app.post('/updatePresentation', function (req, res) {
  var file = fs.readFileSync(__dirname + '/data.json', "utf8");
  var json = JSON.parse(file);
  json.presentation[req.body.id] = req.body.presentation;

  saveDataFile(json, res);
});

app.get('/partial/*', function (req, res) {
  res.sendfile(__dirname + '/views' + req.url + '.html');
});

app.post("/loadState", function (req, res) {
  if(presentations[req.body.title]){
    res.send(presentations[req.body.title]);
  }else{
    res.send(false);
  }
  res.end();
});

app.post("/saveState", function (req, res) {
  presentations[req.body.title] = req.body;
  res.send(true);
  res.end();
});

app.post("/removeState", function (req, res) {
  delete presentations[req.body.title];
  res.send(true);
  res.end();
});

/**
* JS
**/
app.get('/js/*', function (req, res) {
  fs.readFile(__dirname + req.url, function (err, file){sendJavascript(err, file, res)});
});

/**
* CSS
**/
app.get('/css/*.css', function (req, res) {
  fs.readFile(__dirname + req.url, function (err, file){sendCss(err, file, res)});
});

/**
* Images
**/
app.get('/img/*.png', function (req, res) {
  fs.readFile(__dirname + req.url, function (err, file){sendPng(err, file, res)});
});

app.get('/img/*.jpg', function (req, res) {
  fs.readFile(__dirname + req.url, function (err, file){sendJpg(err, file, res)});
});

/**
* JSON
**/
app.get('/data.json', function (req, res) {
  fs.readFile(__dirname + '/data.json', function (err, file){sendJson(err, file, res)});
});

/**
* 404
**/
app.use(function (req, res, next) {
  res.setHeader("Content-Type", "text/plain");
  res.send(404, "Page introuvable !");
});

/**
* fonctions
**/
function saveDataFile(json, res){
  fs.writeFile(__dirname + '/data.json', JSON.stringify(json, null, 4), function(err) {
    if(err) {
      console.log(err);
      res.send(false);
    } else {
      console.log("JSON saved to " + __dirname + '/data.json');
      res.send(true);
    }
    res.end();
  });
}

function sendJavascript(err, file, res){
  if (err) throw err;
  res.setHeader('content-type', 'text/javascript');
  res.write(file, "utf-8");
  res.end();
}

function sendJson(err, file, res){
  if (err) throw err;
  res.setHeader('content-type', 'application/json');
  res.write(file, "utf-8");
  res.end();
}

function sendCss(err, file, res){
  if (err) throw err;
  res.setHeader('content-type', 'text/css');
  res.write(file, "utf-8");
  res.end();
}

function sendJpg(err, file, res){
  if (err) throw err;
  res.setHeader('content-type', 'image/jpeg');
  res.write(file, "utf-8");
  res.end();
}

function sendPng(err, file, res){
  if (err) throw err;
  res.setHeader('content-type', 'image/png');
  res.write(file, "utf-8");
  res.end();
}

function file(path){
	var file = fs.readFileSync(__dirname + path, "utf8");
	return file;
}

/**
* Serveur temps réel
**/
app.io.on("connection", function(socket){
  var room="";

  /**
  * Connexion
  **/
  app.io.route('login', function(req){
    room = req.data.room;
    socket.emit('logged');
  });

  /**
  * Reception d'un message
  **/
  app.io.route('newmsg', function(req){
    req.io.room(room).broadcast('newmsg', {message: req.data.message, user: req.data.user});
  });

  /**
  * Creation d'une salle
  **/
  app.io.route("createRoom", function(req){
    socket.join(req.data.room);
  });
});

app.listen(8080);

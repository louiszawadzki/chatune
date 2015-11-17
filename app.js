var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

app.set('views', __dirname + "/public");
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'))
app.get('/', function(req, res){
		res.render('autotune.html');
});

var options = {
    debug: true
}
var server = require('http').createServer(app);

app.use('/peerjs', ExpressPeerServer(server, options));

server.listen(9002);

server.on('connection', function(id){
	console.log(server);
});

server.on('disconnect', function(id){
	//TODO
});

var express = require('express');
var app = express();
var serv = require('http').Server(app);

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    console.log('socket connection');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/level_1.html');
});

app.use(express.static(__dirname + '/public'));

serv.listen(3001);
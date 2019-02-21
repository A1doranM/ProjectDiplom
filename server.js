let express = require('express');
let app = express();
let serv = require('http').Server(app);

let io = require('socket.io')(serv, {});

let SOCKET_LIST = {};
let PLAYER_LIST = {};

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/level_1.html');
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

serv.listen(3001);

let Player = function(id){
    let self = {
        x: 10,
        y: 30,
        id: id,
        number: number = "" + Math.floor(10 * Math.random()),
        pressingLeft: false,
        pressingRight: false,
        pressingUP: false,
        pressingDowm: false,
        maxSpd: 2
    };
    self.updatePosition = function(){
      if(self.pressingLeft)
          self.x -= self.maxSpd;
      if(self.pressingRight)
          self.x += self.maxSpd;
      if(self.pressingUP)
          self.y -= self.maxSpd;
      if(self.pressingDowm)
          self.y += self.maxSpd;
    };

    return self;
};

io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    let player = new Player(socket.id);
    PLAYER_LIST[socket.id] = player;

    console.log('player connected');

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });

    socket.on('move', function(data){
       switch (data.inputID){
           case 'left':
               player.pressingLeft = data.state;
               break;
           case 'right':
               player.pressingRight = data.state;
               break;
           case 'UP':
               player.pressingUP = data.state;
               break;
           case 'Down':
               player.pressingDown = data.state;
               break;
       }
    });
});

setInterval(function () {
    let currentPlayers = [];
    for(let i in PLAYER_LIST){
        let player = PLAYER_LIST[i];
        player.updatePosition();
        currentPlayers.push({
            x:player.x,
            y:player.y,
            number: player.number
        })
    }

    for(let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i];
        socket.emit('newPosition', currentPlayers);
    }
}, 1000/25);

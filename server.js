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

let Entity = function () {
    let self = {
        x: 10,
        y: 10,
        spdX: 0,
        spdY: 0,
        id: '',
    };

    self.update = function(){
        self.updatePosition();
    };

    self.updatePosition = function(){
      self.x += self.spdX;
      self.y += self.spdY;
    };

    return self;
};

let Player = function(id){
    let self = Entity();
    self.id = id;
    self.number = "" + Math.floor(10 * Math.random());
    self.pressingLeft = false;
    self.pressingRight = false;
    self.pressingUP = false;
    self.pressingDowm = false;
    self.maxSpd = 2;

    let super_update = self.update;
    self.update = function(){
        self.updateSpeed();
        super_update();
    };

    self.updateSpeed = function(){
      if(self.pressingLeft)
          self.x -= self.maxSpd;
      if(self.pressingRight)
          self.x += self.maxSpd;
      if(self.pressingUP)
          self.y -= self.maxSpd;
      if(self.pressingDowm)
          self.y += self.maxSpd;
    };

    Player.list[id] = self;
    return self;
};
Player.list = {};

Player.onConnect = function(socket){
    let player = new Player(socket.id);
    console.log('player connected');
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

};

Player.onDisconnect = function(socket){
    delete Player.list[socket.id];
};

Player.update = function(){
    let currentPlayers = [];
    for(let i in Player.list){
        let player = Player.list[i];
        player.updatePosition();
        currentPlayers.push({
            x:player.x,
            y:player.y,
            number: player.number
        })
    }
    return currentPlayers;
};

io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    Player.onConnect(socket);

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });
});

setInterval(function () {
    let package = Player.update();

    for(let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i];
        socket.emit('newPosition', currentPlayers);
    }
}, 1000/25);

let express = require('express');
let app = express();
let serv = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/level_1.html');
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

serv.listen(3002);

let SOCKET_LIST = {};

let Entity = function(){
    let self = {
        x:10,
        y:30,
        spdX:0,
        spdY:0,
        id:"",
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
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUP = false;
    self.pressingDown = false;
    self.maxSpd = 10;

    let super_update = self.update;
    self.update = function(){
        self.updateSpd();
        super_update();
    };

    self.updateSpd = function(){
        if(self.pressingRight) {
            self.spdX = self.maxSpd;
        }
        else if(self.pressingLeft) {
            self.spdX = -self.maxSpd;
        }
        else {
            self.spdX = 0;
        }

        if(self.pressingUP) {
            self.spdY = -self.maxSpd;
        }
        else if(self.pressingDown) {
            self.spdY = self.maxSpd;
        }
        else {
            self.spdY = 0;
        }
    };

    Player.list[id] = self;
    return self;
};

Player.list = {};

Player.onConnect = function(socket) {
    let player = Player(socket.id);
    socket.on('move', function (data) {
        switch (data.inputID) {
            case 'left':
                player.pressingLeft = data.state;
                break;
            case 'right':
                player.pressingRight = data.state;
                break;
            case 'UP':
                player.pressingUP = data.state;
                break;
            case 'down':
                player.pressingDown = data.state;
                break;
        }
    });

    console.log('player connected');
};

Player.onDisconnect = function(socket){
    delete Player.list[socket.id];
};

Player.update = function(){
    let pack = [];
    for(let i in Player.list){
        let player = Player.list[i];
        player.update();
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number
        });
    }
    return pack;
};

let Bullet = function(angle){
    let self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle/180*Math.PI) * 10;
    self.spdY = Math.sin(angle/180*Math.PI) * 10;

    self.timer = 0;
    self.toRemove = false;
    let super_update = self.update;
    self.update = function(){
        if(self.timer++ > 100)
            self.toRemove = true;
        super_update();
    };
    Bullet.list[self.id] = self;
    return self;
};

Bullet.list = {};

Bullet.update = function(){
    if(Math.random() < 0.1){
        Bullet(Math.random()*360);
    }

    let pack = [];

    for(let i in Bullet.list){
        let bullet = Bullet.list[i];
        bullet.update();
        pack.push({
            x:bullet.x,
            y:bullet.y,
        });
    }
    return pack;
};

let io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    Player.onConnect(socket);

    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });
});

setInterval(function(){

    let pack = {
        player: Player.update(),
        bullet: Bullet.update(),
    };

    for(let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }
}, 1000/25);

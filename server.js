let express = require('express');
let app = express();
let serv = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/level_1.html');
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

serv.listen(3001);

let SOCKET_LIST = {};
let PLAYER_LIST = {};

// let Entity = function(){
//     let self = {
//         x:10,
//         y:30,
//         spdX:0,
//         spdY:0,
//         id:"",
//     };
//
//     self.update = function(){
//         self.updatePosition();
//     };
//
//     self.updatePosition = function(){
//         self.x += self.spdX;
//         self.y += self.spdY;
//     };
//
//     return self;
// };
//
// let Player = function(id){
//     let self = Entity();
//     self.id = id;
//     self.number = "" + Math.floor(10 * Math.random());
//     self.pressingRight = false;
//     self.pressingLeft = false;
//     self.pressingUp = false;
//     self.pressingDown = false;
//     self.maxSpd = 10;
//
//     let super_update = self.update;
//     self.update = function(){
//         self.updateSpd();
//         super_update();
//     };
//
//     self.updateSpd = function(){
//         if(self.pressingRight) {
//             self.spdX = self.maxSpd;
//         }
//         else if(self.pressingLeft) {
//             self.spdX = -self.maxSpd;
//         }
//         else {
//             self.spdX = 0;
//         }
//
//         if(self.pressingUp) {
//             self.spdY = -self.maxSpd;
//         }
//         else if(self.pressingDown) {
//             self.spdY = self.maxSpd;
//         }
//         else {
//             self.spdY = 0;
//         }
//     };
//
//     Player.list[id] = self;
//     return self;
// };
//
// Player.list = {};
//
// Player.onConnect = function(socket) {
//     let player = Player(socket.id);
//     socket.on('move', function (data) {
//         switch (data.inputID) {
//             case 'left':
//                 player.pressingLeft = data.state;
//                 break;
//             case 'right':
//                 player.pressingRight = data.state;
//                 break;
//             case 'UP':
//                 player.pressingUP = data.state;
//                 break;
//             case 'Down':
//                 player.pressingDown = data.state;
//                 break;
//         }
//     });
//
//     console.log('player connected');
// };
//
// Player.onDisconnect = function(socket){
//     delete Player.list[socket.id];
// };
//
// Player.update = function(){
//     let pack = [];
//     for(let i in Player.list){
//         let player = Player.list[i];
//         player.update();
//         pack.push({
//             x:player.x,
//             y:player.y,
//             number:player.number
//         });
//     }
//     return pack;
// };
//
// let io = require('socket.io')(serv, {});
// io.sockets.on('connection', function(socket){
//     socket.id = Math.random();
//     SOCKET_LIST[socket.id] = socket;
//
//     Player.onConnect(socket);
//
//     socket.on('disconnect',function(){
//         delete SOCKET_LIST[socket.id];
//         Player.onDisconnect(socket);
//     });
// });
//
// setInterval(function(){
//     let pack = Player.update();
//
//     for(let i in SOCKET_LIST){
//         let socket = SOCKET_LIST[i];
//         socket.emit('newPositions',pack);
//     }
// }, 1000/25);

////////////////////////


////////////////////////
let Player = function(id){
    let self = {
        x: 10,
        y: 30,
        id: id,
        number: number = "" + Math.floor(10 * Math.random()),
        pressingLeft: false,
        pressingRight: false,
        pressingUP: false,
        pressingDown: false,
        maxSpd: 2
    };

    self.updatePosition = function(){
        if(self.pressingLeft)
            self.x -= self.maxSpd;
        if(self.pressingRight)
            self.x += self.maxSpd;
        if(self.pressingUP)
            self.y -= self.maxSpd;
        if(self.pressingDown)
            self.y += self.maxSpd;
    };

    return self;
};

let io = require('socket.io')(serv, {});
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
            case 'down':
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

////////////////////////////////////
//kl/kl/kl/kl/
/////////////////////////////////////

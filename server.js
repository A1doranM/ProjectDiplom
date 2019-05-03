let mysql = require('mysql');
let DBConnection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '1q2w3e3e2w1q4r',
    database: 'diplom'
});


let express = require('express');
let app = express();
let serv = require('http').Server(app);

app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/client/login.html');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/level_1', function (req, res) {
    res.sendFile(__dirname + '/client/level_1.html');
});


// executeQ();

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

    self.getDistance = function (pt) {
        return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
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
    self.pressingAttack = false;
    self.bulletAngle = 0;
    self.maxSpd = 10;

    let super_update = self.update;
    self.update = function(){
        self.updateSpd();
        super_update();

        if(self.pressingAttack){
            for(let i = -3; i < 3; i++){
                self.shootBullet(i * 10 + self.angle);
            }
            self.shootBullet(self.bulletAngle);
        }
    };

    self.shootBullet = function(angle){
        let b = Bullet(self.id, angle);
        b.x = self.x;
        b.y = self.y;
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
    socket.on('action', function (data) {
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
            case 'attack':
                player.pressingAttack = data.state;
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

let Bullet = function(parent, angle){
    let self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle/180*Math.PI) * 10;
    self.spdY = Math.sin(angle/180*Math.PI) * 10;
    self.timer = 0;
    self.parent = parent;
    self.toRemove = false;

    let super_update = self.update;
    self.update = function(){
        if(self.timer++ > 100)
            self.toRemove = true;
        super_update();

        for(let i in Player.list){
            let p = Player.list[i];
            if(self.getDistance(p) < 32 && self.parent !== p.id){
                self.toRemove = true;
            }
        }
    };

    Bullet.list[self.id] = self;
    return self;
};

Bullet.list = {};

Bullet.update = function(){
    let pack = [];

    for(let i in Bullet.list){
        let bullet = Bullet.list[i];
        bullet.update();

        if(bullet.toRemove){
            delete Bullet.list[i];
        } else {
            pack.push({
                x: bullet.x,
                y: bullet.y,
            });
        }
    }
    return pack;
};

let isUPasswordValid     = function (data) {
    return '';
};

let isUserNameTaken = function (data) {
    return '';
};

let addUser = function (data) {
    return '';
};

let io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('signIn',function(data){
        DBConnection.query('select users.login from diplom.users where users.password=? and users.email=?', [data.password, data.email], function (err, result) {
            if(result[0] === undefined) {
                socket.emit('SignInResponse', {success: false});
            } else {
                socket.emit('SignInResponse', {success: true});
            }
        });
    });

    socket.on('signUp',function(data){
        DBConnection.query('insert into diplom.users (login, email, password) values (?, ?, ?)', [data.login, data.email, data.password], function (err, result) {
            if(err) throw err;
            socket.emit('SignInResponse', {success: true});
        });
    });

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

let isValidUser = function(data){
    DBConnection.query('select users.login from users where users.password = '
        + data.password + 'and users.login = ' + data.email, function (err, result, fields) {
        if(result === null){
            socket.emit('authResp', false);
        }
    });
};
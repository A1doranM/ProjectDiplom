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
    res.sendFile(__dirname + '/client/Welcome.html');
});

app.get('/aboutus', function (req, res) {
    res.sendFile(__dirname + '/client/About_Us.html');
});

app.get('/howtoplay', function (req, res) {
    res.sendFile(__dirname + '/client/How_to_play.html');
});

app.get('/PVP', function (req, res) {
    res.sendFile(__dirname + '/client/level_PVP.html');
});

app.get('/level_1', function (req, res) {
    res.sendFile(__dirname + '/client/level_1.html');
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/External Libraries'));

serv.listen(2000);

let SOCKET_LIST = {};

let Entity = function(param){
    let self = {
        x:1750,
        y:1500,
        spdX:0,
        spdY:0,
        id:"",
        map:'level_1',
    };
    if(param){
        if(param.x)
            self.x = param.x;
        if(param.y)
            self.y = param.y;
        if(param.map)
            self.map = param.map;
        if(param.id)
            self.id = param.id;
    }

    self.update = function(){
        self.updatePosition();
    };
    self.updatePosition = function(){
        self.x += self.spdX;
        self.y += self.spdY;
    };
    self.getDistance = function(pt){
        return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
    };
    return self;
};

let Player = function(param){
    let self = Entity(param);
    self.number = "" + Math.floor(10 * Math.random());
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingAttack = false;
    self.bulletAngle = 0;
    self.maxSpd = 10;
    self.hp = 10;
    self.hpMax = 10;
    self.score = 0;
    self.win = false;

    let super_update = self.update;
    self.update = function(){
        self.updateSpd();

        super_update();

        if(self.pressingAttack){
            self.shootBullet(self.bulletAngle);
        }
    };

    self.shootBullet = function(angle){
        Bullet({
            parent:self.id,
            angle:angle,
            x:self.x,
            y:self.y,
            map:self.map,
        });
    };

    self.updateSpd = function(){
        if(self.pressingRight)
            self.spdX = self.maxSpd;
        else if(self.pressingLeft)
            self.spdX = -self.maxSpd;
        else
            self.spdX = 0;

        if(self.pressingUp)
            self.spdY = -self.maxSpd;
        else if(self.pressingDown)
            self.spdY = self.maxSpd;
        else
            self.spdY = 0;
    };

    self.getInitPackage = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            number:self.number,
            hp:self.hp,
            hpMax:self.hpMax,
            score:self.score,
            map:self.map,
            win:self.win,
        }
    };

    self.getUpdatePackage = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            hp:self.hp,
            score:self.score,
            win:self.win,
        }
    };

    Player.list[self.id] = self;

    initPackage.player.push(self.getInitPackage());
    return self;
};

Player.list = {};
Player.onConnect = function(socket){
    let map = 'level_1';
    if(Math.random() < 0.5)
        map = 'level_1';
    let player = Player({
        id:socket.id,
        map:map,
    });

    socket.on('denyWin', function (data) {
        player.win = data.state;
    });

    socket.on('saveStatsPVP', function (data) {
        player.score = data.state;
    });

    socket.on('action', function (data) {
        switch (data.inputID) {
            case 'left':
                player.pressingLeft = data.state;
                break;
            case 'right':
                player.pressingRight = data.state;
                break;
            case 'UP':
                player.pressingUp = data.state;
                break;
            case 'down':
                player.pressingDown = data.state;
                break;
            case 'attackL':
                player.pressingAttack = data.state;
                if(data.angle !== undefined) {
                    player.bulletAngle = 180 + data.angle;
                } else {
                    player.bulletAngle = 180
                }
                break;
            case 'attackR':
                player.pressingAttack = data.state;
                if(data.angle !== undefined) {
                    player.bulletAngle = 0 + data.angle;
                } else {
                    player.bulletAngle = 0
                }
                break;
            case 'attackU':
                player.pressingAttack = data.state;
                if(data.angle !== undefined) {
                    player.bulletAngle = 270 + data.angle;
                } else {
                    player.bulletAngle = 270
                }
                break;
            case 'attackD':
                player.pressingAttack = data.state;
                if(data.angle !== undefined) {
                    player.bulletAngle = 90 + data.angle;
                } else {
                    player.bulletAngle = 90
                }
                break;
            // case 'attackR':
            //     player.pressingAttack = data.state;
            //     player.bulletAngle = 0;
            //     break;
            // case 'attackU':
            //     player.pressingAttack = data.state;
            //     player.bulletAngle = 90;
            //     break;
            // case 'attackD':
            //     player.pressingAttack = data.state;
            //     player.bulletAngle = 270;
            //     break;
        }
    });


    socket.emit('init',{
        selfId:socket.id,
        player:Player.getAllInitPack(),
        bullet:Bullet.getAllInitPack(),
    })
};

Player.getAllInitPack = function(){
    let players = [];
    for(let i in Player.list)
        players.push(Player.list[i].getInitPackage());
    return players;
};

Player.onDisconnect = function(socket){
    delete Player.list[socket.id];
    removePackage.player.push(socket.id);
};

Player.update = function(){
    let pack = [];
    for(let i in Player.list){
        let player = Player.list[i];
        player.update();
        pack.push(player.getUpdatePackage());
    }
    return pack;
};

let Bullet = function(param){
    let self = Entity(param);
    self.id = Math.random();
    self.angle = param.angle;
    self.spdX = Math.cos(param.angle/180*Math.PI) * 10;
    self.spdY = Math.sin(param.angle/180*Math.PI) * 10;
    self.parent = param.parent;

    self.timer = 0;
    self.toRemove = false;
    let super_update = self.update;
    self.update = function(){
        if(self.timer++ > 100)
            self.toRemove = true;
        super_update();

        for(let i in Player.list){
            let p = Player.list[i];
            if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id){
                p.hp -= 1;

                if(p.hp <= 0){
                    let shooter = Player.list[self.parent];
                    if(shooter)
                        shooter.score += 1;
                        shooter.win = true;
                    p.hp = p.hpMax;
                    p.x = Math.random() * 500;
                    p.y = Math.random() * 500;
                }
                self.toRemove = true;
            }
        }
    };

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            map:self.map,
        };
    };

    self.getUpdatePack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
        };
    };

    Bullet.list[self.id] = self;
    initPackage.bullet.push(self.getInitPack());
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
            removePackage.bullet.push(bullet.id);
        } else
            pack.push(bullet.getUpdatePack());
    }
    return pack;
};

Bullet.getAllInitPack = function(){
    let bullets = [];
    for(let i in Bullet.list)
        bullets.push(Bullet.list[i].getInitPack());
    return bullets;
};

let io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('signIn',function(data){
        // DBConnection.query('select users.login from diplom.users where users.password=? and users.email=?', [data.password, data.email], function (err, result) {
        //     if(result[0] === undefined) {
        //         socket.emit('SignInResponse', {success: false});
        //     } else {
        //         socket.emit('SignInResponse', {success: true});
        //     }
        // });
        socket.emit('SignInResponse', {success: true});
    });

    socket.on('signUp',function(data){
        // DBConnection.query('insert into diplom.users (login, email, password) values (?, ?, ?)', [data.login, data.email, data.password], function (err, result) {
        //     if(err) throw err;
        //     socket.emit('SignUnResponse', {success: true});
        // });
        socket.emit('SignUpResponse', {success: true});
    });

    Player.onConnect(socket);
    console.log("player connect");

    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });
});

let initPackage = {player:[],bullet:[]};
let removePackage = {player:[],bullet:[]};


setInterval(function(){
    let pack = {
        player:Player.update(),
        bullet:Bullet.update(),
    };

    for(let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i];
        socket.emit('init',initPackage);
        socket.emit('update',pack);
        socket.emit('remove',removePackage);
    }
    initPackage.player = [];
    initPackage.bullet = [];
    removePackage.player = [];
    removePackage.bullet = [];

},1000/25);
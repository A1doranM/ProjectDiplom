let ctx = document.getElementById("game").getContext("2d");
ctx.font = '30px Arial';

//game
let Img = {};
Img.player = new Image();
Img.player.src = '../assets/player.png';
Img.bullet = new Image();
Img.bullet.src = '../assets/bullet.png';

Img.map = {};
Img.map['level_1'] = new Image();
Img.map['level_1'].src = '../assets/map.png';
Img.map['level_1'] = new Image();
Img.map['level_1'].src = '../assets/map2.png';

let socket = io();

let WIDTH = 750;
let HEIGHT = 750;

//initial package
let Player = function (initPack) {
    let self = {};
    self.id = initPack.id;
    self.number = initPack.number;
    self.x = initPack.x;
    self.y = initPack.y;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.score = initPack.score;
    self.map = initPack.map;

    self.draw = function(){
        if(Player.list[selfId].map !== self.map){
            return;
        }
        let x = self.x - Player.list[selfId].x + WIDTH/2;
        let y = self.y - Player.list[selfId].y + HEIGHT/2;

        let hpWidth = 30 * self.hp / self.hpMax;
        ctx.fillStyle = 'red';
        ctx.fillRect(x - hpWidth/2, y - 40, hpWidth, 4);

        let width = Img.player.width*2;
        let height = Img.player.height*2;

        ctx.drawImage(Img.player,
            0, 0, Img.player.width, Img.player.height,
            x - width/2, y - height/2, width, height);

        //ctx.fillText(self.score, self.x, self.y-60);
    };

    Player.list[self.id] = self;
    return self;
};
Player.list = {};

let Bullet = function(initPack){
    let self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.map = initPack.map;

    self.draw = function(){
        if(Player.list[selfId].map !== self.map){
            return;
        }
        let width = Img.bullet.width/2;
        let height = Img.bullet.width/2;

        let x = self.x - Player.list[selfId].x + WIDTH/2;
        let y = self.y - Player.list[selfId].y + HEIGHT/2;

        ctx.drawImage(Img.bullet,
            0, 0, Img.bullet.width, Img.bullet.height,
            x - width/2, y - height/2, width, height);
    };

    Bullet.list[self.id] = self;
    return self;
};
Bullet.list = {};

let selfId = null;

socket.on('init', function (data) {
    if(data.selfId){
        selfId = data.selfId;
    }
    for(let i = 0; i < data.player.length; i++){
        new Player(data.player[i]);
    }
    for(let i = 0; i < data.bullet.length; i++){
        new Bullet(data.bullet[i]);
    }
});

//update package
socket.on('update', function (data) {
    for(let i = 0; i < data.player.length; i++){
        let pack = data.player[i];
        let p = Player.list[pack.id];
        if(p){
            if(pack.x !== undefined)
                p.x = pack.x;
            if(pack.y !== undefined)
                p.y = pack.y;
            if(pack.hp !== undefined)
                p.hp = pack.hp;
            if(pack.score !== undefined)
                p.score = pack.score;

        }
    }

    for(let i = 0; i < data.bullet.length; i++){
        let pack = data.bullet[i];
        let b = Bullet.list[data.bullet[i].id];
        if(b){
            if(pack.x !== undefined)
                b.x = pack.x;
            if(pack.y !== undefined)
                b.y = pack.y;
        }
    }
});

//remove package
socket.on('remove', function (data) {
    for(let i = 0; i < data.player.length; i++){
        delete Player.list[data.player[i]];
    }
    for(let i = 0; i < data.bullet.length; i++){
        delete Bullet.list[data.bullet[i]];
    }
});
///////////////////////

setInterval(function () {
    if(!selfId){
        return;
    }
    ctx.clearRect(0,0,750,750);
    drawMap();
    drawScore();
    for(let i in Player.list){
        Player.list[i].draw();
    }
    for(let i in Bullet.list){
        Bullet.list[i].draw();
    }
}, 40);

let drawMap = function () {
    let player = Player.list[selfId];
    let x = WIDTH/2 - player.x;
    let y = HEIGHT/2 - player.y;
    ctx.drawImage(Img.map[player.map], x, y);
};

let lastScore = null;
let drawScore = function () {
    if(lastScore === Player.list[selfId].score)
        return;
    ctx.fillStyle = 'white';
    ctx.fillText(Player.list[selfId].score, 0, 30);
};

function Run () {
    let script = document.getElementById("code").value;
    eval(script);
}

let Hero = function () {
    this.moveLeft = function(){
        socket.emit('action', {inputID:'left', state: true});
    };
    this.moveRight = function(){
        socket.emit('action', {inputID:'right', state: true});
    };
    this.moveUP = function(){
        socket.emit('action', {inputID:'UP', state: true});
    };
    this.moveDown = function(){
        socket.emit('action', {inputID:'down', state: true});
    };
    this.shoot = function () {
        socket.emit('action', {inputID:'attack', state: true});
    }
};

document.onkeydown = function(event){
    if(event.keyCode === 68)    //d
        socket.emit('action',{inputID:'right',state:true});
    else if(event.keyCode === 83)   //s
        socket.emit('action',{inputID:'down',state:true});
    else if(event.keyCode === 65) //a
        socket.emit('action',{inputID:'left',state:true});
    else if(event.keyCode === 87) // w
        socket.emit('action',{inputID:'UP',state:true});
    else if(event.keyCode === 66)
        socket.emit('action', {inputID:'attack', state: true});
};
document.onkeyup = function(event){
    if(event.keyCode === 68)    //d
        socket.emit('action',{inputID:'right',state:false});
    else if(event.keyCode === 83)   //s
        socket.emit('action',{inputID:'down',state:false});
    else if(event.keyCode === 65) //a
        socket.emit('action',{inputID:'left',state:false});
    else if(event.keyCode === 87) // w
        socket.emit('action',{inputID:'UP',state:false});
    else if(event.keyCode === 66)
        socket.emit('action', {inputID:'attack', state: false});
};

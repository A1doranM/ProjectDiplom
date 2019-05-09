let ctx = document.getElementById("game").getContext("2d");
ctx.font = '30px Arial';

let socket = io();


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

    self.draw = function(){
        let hpWidth = 30 * self.hp / self.hpMax;
        ctx.fillRect(self.x - hpWidth/2, self.y - 40, hpWidth, 4);
        ctx.fillText(self.number, self.x, self.y);

        ctx.fillText(self.score, self.x, self.y-60);
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

    self.draw = function(){
        ctx.fillRect(self.x-5, self.y-5, 10, 10);
    };

    Bullet.list[self.id] = self;
    return self;
};
Bullet.list = {};

socket.on('init', function (data) {
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
    }

    for(let i = 0; i < data.bullet.length; i++){
        let pack = data.bullet[i];
        let b = Bullet.list[pack.id];
        if(b){
            if(b){
                if(pack.x !== undefined)
                    b.x = pack.x;
                if(pack.y !== undefined)
                    b.y = pack.y;
            }
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
   ctx.clearRect(0,0,950,750);
   for(let i in Player.list){
       Player.list[i].draw();
   }
   for(let i in Bullet.list){
       Bullet.list[i].draw();
   }
}, 40);

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
        socket.emit('action', {inputID:'attack', state: true});
};
//
// let p = new Player();
// p.moveRight();
//
// function func() {
//     socket.emit('action', {inputID:'right',state:false});
// }
//
// setTimeout(func, 1000);
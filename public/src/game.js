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
    Player.list[self.id] = self;
    return self;
};
Player.list = {};

let Bullet = function(initPack){
    let self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
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
            if((pack.x !== undefined) && (pack.y !== undefined)){
                p.x = pack.x;
                p.y = pack.y;
            }
        }
    }

    for(let i = 0; i < data.bullet.length; i++){
        let pack = data.bullet[i];
        let b = Bullet.list[pack.id];
        if(b){
            if((pack.x !== undefined) && (pack.y !== undefined)){
                b.x = pack.x;
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
       ctx.fillText(Player.list[i].number, Player.list[i].x, Player.list[i].y);
   }
   for(let i in Bullet.list){
       ctx.fillRect(Bullet.list[i].x-5, Bullet.list[i].y-5, 10, 10);
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

// document.onkeydown = function(event){
//     if(event.keyCode === 68)    //d
//         socket.emit('action',{inputID:'right',state:true});
//     else if(event.keyCode === 83)   //s
//         socket.emit('action',{inputID:'down',state:true});
//     else if(event.keyCode === 65) //a
//         socket.emit('action',{inputID:'left',state:true});
//     else if(event.keyCode === 87) // w
//         socket.emit('action',{inputID:'up',state:true});
//
// };
// document.onkeyup = function(event){
//     if(event.keyCode === 68)    //d
//         socket.emit('action',{inputID:'right',state:false});
//     else if(event.keyCode === 83)   //s
//         socket.emit('action',{inputID:'down',state:false});
//     else if(event.keyCode === 65) //a
//         socket.emit('action',{inputID:'left',state:false});
//     else if(event.keyCode === 87) // w
//         socket.emit('action',{inputID:'up',state:false});
// };
//
// let p = new Player();
// p.moveRight();
//
// function func() {
//     socket.emit('action', {inputID:'right',state:false});
// }
//
// setTimeout(func, 1000);
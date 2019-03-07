let ctx = document.getElementById("game").getContext("2d");
ctx.font = '30px Arial';

let socket = io();

socket.on('newPositions',function(data){
    ctx.clearRect(0,0,950,750);
    for(let i = 0 ; i < data.player.length; i++)
        ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y);
});

function Run () {
    let script = document.getElementById("code").value;
    eval(script);
    // let player = new Player();
    // player.moveRight();
}

let field = document.getElementById('code');

let Player = function () {
    this.moveLeft = function(){
        socket.emit('move', {inputID:'left', state: true});
    };
    this.moveRight = function(){
        socket.emit('move', {inputID:'right', state: true});
    };
    this.moveUP = function(){
        socket.emit('move', {inputID:'UP', state: true});
    };
    this.moveDown = function(){
        socket.emit('move', {inputID:'down', state: true});
    };
};
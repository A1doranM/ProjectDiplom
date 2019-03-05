let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

ctx.font = '30px Arial';

let socket = io();

socket.on('newPosition', function (data) {
    ctx.clearRect(0, 0, 950, 750);
    for(let i = 0; i < data.length; i++) {
        ctx.fillText(data[i].number, data[i].x, data[i].y);
    }
});

function Run () {
    let script = document.getElementById("code").value;
    eval(script);
    //let player = new Player();
    //player.moveRight();
}

let field = document.getElementById('code');

field.onkeydown = function(event){
    if(event.keyCode === 68)    //d
        socket.emit('move',{inputID:'right',state:true});
    else if(event.keyCode === 83)   //s
        socket.emit('move',{inputID:'down',state:true});
    else if(event.keyCode === 65) //a
        socket.emit('move',{inputID:'left',state:true});
    else if(event.keyCode === 87) // w
        socket.emit('move',{inputID:'UP',state:true});
};

field.onkeyup = function(event){
    if(event.keyCode === 68)    //d
        socket.emit('move',{inputID:'right',state:false});
    else if(event.keyCode === 83)   //s
        socket.emit('move',{inputID:'down',state:false});
    else if(event.keyCode === 65) //a
        socket.emit('move',{inputID:'left',state:false});
    else if(event.keyCode === 87) // w
        socket.emit('move',{inputID:'UP',state:false});
};

let Player = function () {
    this.moveLeft = function(){
        socket.emit('move', {inputID:'left', state: true});
    };
    this.moveRight = function(){
        socket.emit('move', {inputID:'right', state: true});
    };
    this.moveUp = function(){
        socket.emit('move', {inputID:'UP', state: true});
    };
    this.moveDown = function(){
        socket.emit('move', {inputID:'down', state: true});
    };
};
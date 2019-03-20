let ctx = document.getElementById("game").getContext("2d");
ctx.font = '30px Arial';

let socket = io();

socket.on('newPositions',function(data){
    ctx.clearRect(0,0,950,750);
    for(let i = 0 ; i < data.player.length; i++) {
        ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y);
    }
    for(var i = 0 ; i < data.bullet.length; i++) {
        ctx.fillRect(data.bullet[i].x - 5, data.bullet[i].y - 5, 10, 10);
    }
});

function Run () {
    let script = document.getElementById("code").value;
    eval(script);
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

// document.onkeydown = function(event){
//     if(event.keyCode === 68)    //d
//         socket.emit('move',{inputID:'right',state:true});
//     else if(event.keyCode === 83)   //s
//         socket.emit('move',{inputID:'down',state:true});
//     else if(event.keyCode === 65) //a
//         socket.emit('move',{inputID:'left',state:true});
//     else if(event.keyCode === 87) // w
//         socket.emit('move',{inputID:'up',state:true});
//
// };
// document.onkeyup = function(event){
//     if(event.keyCode === 68)    //d
//         socket.emit('move',{inputID:'right',state:false});
//     else if(event.keyCode === 83)   //s
//         socket.emit('move',{inputID:'down',state:false});
//     else if(event.keyCode === 65) //a
//         socket.emit('move',{inputID:'left',state:false});
//     else if(event.keyCode === 87) // w
//         socket.emit('move',{inputID:'up',state:false});
// };
//
// let p = new Player();
// p.moveRight();
//
// function func() {
//     socket.emit('move',{inputID:'right',state:false});
// }
//
// setTimeout(func, 1000);
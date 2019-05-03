let ctx = document.getElementById("game").getContext("2d");
ctx.font = '30px Arial';

let socket = io();

socket.on('newPositions',function(data){
    ctx.clearRect(0,0,950,750);
    for(let i = 0 ; i < data.player.length; i++) {
        ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y);
    }
    for(let i = 0 ; i < data.bullet.length; i++) {
        ctx.fillRect(data.bullet[i].x - 5, data.bullet[i].y - 5, 10, 10);
    }
});

function Run () {
    let script = document.getElementById("code").value;
    eval(script);
}

let Player = function () {
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
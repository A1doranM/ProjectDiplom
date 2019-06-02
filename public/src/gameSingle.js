let ctx = document.getElementById("game").getContext("2d");
ctx.font = '30px Arial';

//game
let Img = {};
Img.player = new Image();
Img.player.src = '../assets/player.png';
Img.bullet = new Image();
Img.bullet.src = '../assets/bullet.png';

let socket = io();

let TILE_SIZE = 30;
let WIDTH = 1250;
let HEIGHT = 750;

let player;
let object;

function Run () {
    let script = document.getElementById("code").value;
    eval(script);
}


testCollisionRectRect = function(rect1,rect2){
    return rect1.x <= rect2.x+rect2.width
        && rect2.x <= rect1.x+rect1.width
        && rect1.y <= rect2.y + rect2.height
        && rect2.y <= rect1.y + rect1.height;
};

let GameObject = function(name, x, y, width, height){
    let self = {
        x:x,
        y:y,
        height:height,
        width:width,
        name:name,
        rightBumper: x + width/2,
        leftBumper: x - width/2
    };
    return self;
};

object = new GameObject('sofa', 1200,1050, 400, 500);

let Entity = function(x,y,spdX,spdY,width,height,img){
    let self = {
        x:x,
        y:y,
        spdX:spdX,
        spdY:spdY,
        id:"",
        map: 'level_1',
        width:width,
        height:height,
        img:img,
    };

    self.update = function(){
        // self.updatePosition();
        self.draw();
    };

    self.draw = function(){
        ctx.save();

        let x = self.x - player.x + WIDTH/2;
        let y = self.y - HEIGHT/2;

        x -= self.width/2;
        y -= self.height/2;

        ctx.drawImage(self.img,
            0,0,self.img.width,self.img.height,
            x,y,self.width,self.height
        );
        ctx.restore();
    };

    self.updatePosition = function(){
        self.x += self.spdX;
        self.y += self.spdY;
    };

    self.getDistance = function (pt) {
        return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
    };

    self.testCollision = function(entity2){	//return if colliding (true/false)
        let rect1 = {
            x:self.x-self.width/2,
            y:self.y-self.height/2,
            width:self.width,
            height:self.height,
        };
        let rect2 = {
            x:entity2.x-entity2.width/2,
            y:entity2.y-entity2.height/2,
            width:entity2.width,
            height:entity2.height,
        };
        return testCollisionRectRect(rect1,rect2);

    };

    return self;
};

let Player = function(){
    let self = Entity(750,1050,30,5,50,70,Img.player,10,1);
    self.number = "" + Math.floor(10 * Math.random());
    self.bulletAngle = 0;
    self.maxSpd = 30;
    self.hpMax = 5;
    self.score = 0;

    self.moveLeft = function(){
        let leftBumper = {x:self.x - 40,y:self.y};
        self.x -= self.maxSpd;
    };
    self.moveRight = function(){
        let oldX = self.x;
        let rightBumper = {x:self.x + 40,y:self.y};

        if(rightBumper.x === object.leftBumper){
            self.x = oldX;
        }
        else {
            self.x += self.maxSpd;
        }
    };
    self.moveUP = function(){
        let upBumper = {x:self.x,y:self.y - 16};
        self.y -= self.maxSpd;
    };
    self.moveDown = function(){
        let downBumper = {x:self.x,y:self.y + 64};
        self.y += self.maxSpd;
    };
    return self;
};

player = new Player();

Maps = function(id,imgSrc,grid){
    let self = {
        id:id,
        image:new Image(),
        width:grid[0].length * TILE_SIZE,
        height:grid.length * TILE_SIZE,
        grid:grid,
    };
    self.image.src = imgSrc;

    self.isPositionWall = function(pt){
        let gridX = Math.floor(pt.x / TILE_SIZE);
        let gridY = Math.floor(pt.y / TILE_SIZE);
        console.log(gridY + " " + gridY);
        if(gridX < 0 || gridX >= self.grid[0].length) {
            return true;
        }
        if(gridY < 0 || gridY >= self.grid.length) {
            return true;
        }
        return self.grid[gridY][gridX];
    };

    self.draw = function(){
        let x = WIDTH/2 - player.x;
        ctx.drawImage(self.image,0,0,self.image.width,self.image.height,x,0,self.image.width,self.image.height);
    };
    return self;
};

let arrayCollision2D = [];
for(let i = 0 ; i < 25; i++){
    arrayCollision2D[i] = [];
    for(let j = 0 ; j < 240; j++){
        arrayCollision2D[i][j] = collisionArray[i * 25 + j];
    }
}
// let xm = 0;
// let ym = 0;
// for(xm = 0 ; xm < 25; xm++) {
//     console.log("special: " + xm + " " + ym + ": " + arrayCollision2D[xm][ym]);
//     for(ym = 0 ; ym < 240; ym++) {
//         console.log("special: " + xm + " " + ym + ": " + arrayCollision2D[xm][ym]);
//     }
// }

Maps.current = Maps('level_1', '../assets/level_backgrounds/Level_1.png', arrayCollision2D);

setInterval(function () {
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    Maps.current.draw();
    player.update();
    console.log(player.x + " " + player.y);
}, 40);

document.onkeydown = function(event){
    if(event.keyCode === 68)    //d
        player.moveRight();
    else if(event.keyCode === 83)   //s
        player.moveDown();
    else if(event.keyCode === 65) //a
        player.moveLeft();
    else if(event.keyCode === 87) // w
        player.moveUP();
};


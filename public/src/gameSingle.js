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
let gameObjects;
gameObjects = [];

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

let GameObject = function(x, y, width, height, type){
    let self = {
        x:x,
        y:y,
        height:height,
        width:width,
        name:name,
        type:type,
    };
    self.triggerLeft = self.leftBumper + 10;
    self.triggerRight = self.rightBumper + 10;
    self.rightBumper: Math.ceil((x + width/2)/10)*10;
    self.leftBumper: Math.ceil((x - width/2)/10)*10;
    self.upBumper: Math.ceil((y - height/2)/10)*10;
    self.downBumper: Math.ceil((y + height/2)/10)*10;

    self.draw = function (){

    };

    return self;
};

gameObjects[0] = new GameObject(1330, 970, 430, 330, 'sofa');
gameObjects[1] = new GameObject(1940, 220, 60, 120, 'crystal');

//sofa 1330x970
//first crystal 1940x220
//first glass table 1830x1000
//fireplace 2410x690
//second sofa 3000x980
//waredrobe 3860x780
//second crystal 3320x450
//third crystall 4370x450
//second and third tables 5540x1010
//wing 5870x840
//cornflakes 5410x840
//books 5740x840
//last crystal 6930x1030
//last door 7130x1030

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
    self.maxSpd = 10;
    self.hpMax = 5;
    self.score = 0;
    self.heightFromFloor = 0;
    let leftBumper = {x:self.x - 15, y:self.y};
    let rightBumper = {x:self.x + 15, y:self.y};
    let downBumper = {x:self.x, y:self.y + 40};
    let upBumper = {x:self.x, y:self.y - 40};

    let updateBumpers = function(){
        leftBumper = self.x - 30;
        rightBumper = self.x + 30;
        downBumper = self.y + 40;
        upBumper = self.y - 40;
    };

    self.moveLeft = function() {
        updateBumpers();
        let oldX = self.x;
        if (leftBumper === gameObjects[0].rightBumper) {
            if ((upBumper >= gameObjects[0].downBumper) || (downBumper <= gameObjects[0].upBumper)) {
                self.x -= self.maxSpd;
            } else {
                self.x = oldX;
            }
        } else {
            self.x -= self.maxSpd;
        }
    };

    self.moveRight = function(){
        updateBumpers();
        let oldX = self.x;
        let trigger = rightBumper;
        while(trigger < 7200){
            if(trigger === gameObjects[0]){

            }
            trigger += 10;
        }
        console.log(gameObjects[0].leftBumper);
        if (rightBumper === gameObjects[0].leftBumper) {
            if ((upBumper <= gameObjects[0].downBumper) && (downBumper >= gameObjects[0].upBumper)) {
                self.x = oldX;
            } else {
                self.x += self.maxSpd;
            }
        } else {
            self.x += self.maxSpd;
        }
    };
    self.moveUP = function(){
        updateBumpers();
        let oldY = self.y;
        for(let i = 0; i < gameObjects.length; i++) {
            if (upBumper === gameObjects[i].downBumper) {
                if ((leftBumper >= gameObjects[i].rightBumper) || (rightBumper <= gameObjects[i].leftBumper)) {
                    self.y -= self.maxSpd;
                } else {
                    self.y = oldY;
                }
            } else {
                self.y -= self.maxSpd;
            }
        }
    };
    self.moveDown = function(){
        updateBumpers();
        let oldY = self.y;
        for(let i = 0; i < gameObjects.length; i++) {
            if (downBumper === gameObjects[i].upBumper) {
                if ((leftBumper >= gameObjects[i].rightBumper) || (rightBumper <= gameObjects[i].leftBumper)) {
                    self.y += self.maxSpd;
                } else {
                    self.y = oldY;
                }
            } else {
                self.y += self.maxSpd;
            }
        }
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
        console.log('width: ' + self.image.width);
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

Maps.current = Maps('level_1', '../assets/level_backgrounds/Level_1.png', arrayCollision2D);

setInterval(function () {
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    Maps.current.draw();
    player.update();
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

document.getElementById('game').onclick = function(e) {
    console.log(player.x, player.y);
};

//sofa 1330x 970
//first crystal 1940x220
//first glass table 1830x1000
//fireplace 2410x690
//second sofa 3000x980
//waredrobe 3860x780
//second crystal 3320x450
//third crystall 4370x450
//second and third tables 5540x1010
//wing 5870x840
//cornflakes 5410x840
//books 5740x840
//last crystal 6930x1030
//last door 7130x1030

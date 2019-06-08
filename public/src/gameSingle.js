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


//Выполняет команды из консоли
function Run () {
    let script = document.getElementById("code").value;
    eval(script);
}

//не используется
testCollisionRectRect = function(rect1,rect2){
    return rect1.x <= rect2.x+rect2.width
        && rect2.x <= rect1.x+rect1.width
        && rect1.y <= rect2.y + rect2.height
        && rect2.y <= rect1.y + rect1.height;
};

//игровые объекты на карте. Точнее точки куда персоонаж бегает когда ты вводишь команду (они не видимы)
let GameObject = function(x, y, width, height, type){
    let self = {
        x:x,
        y:y,
        height:height,
        width:width,
        name:name,
        type:type,
        rightBumper: Math.ceil((x + width/2)/10)*10,
        leftBumper: Math.ceil((x - width/2)/10)*10,
        upBumper: Math.ceil((y - height/2)/10)*10,
        downBumper: Math.ceil((y + height/2)/10)*10,
    };

    //их рамки когда персоонаж доходит до них то он останавливается
    self.triggerLeft = self.leftBumper + 10;
    self.triggerRight = self.rightBumper + 10;
    self.triggerUP = self.upBumper - 10;
    self.triggerDown = self.downBumper + 10;

    // self.draw = function (){
    //
    // };

    return self;
};

//это я парочку штук на карте создал мы с тобой потом обсудить должны это
// у нас персоонаж
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

    self.countSteps = function(direction, start){
        let trigger = start + 10;
        switch (direction){
            case 'left':
                while(trigger < 7200){
                    for(let i = 0; i < gameObjects.length; i++) {
                        if (trigger === gameObjects[i].rightBumper){
                            let steps = Math.abs((start - 10) - gameObjects[i].rightBumper)/10;
                            return steps;
                        }
                    }
                    trigger += 10;
                }
                break;

            case 'right':
                while(trigger < 7200){
                    for(let i = 0; i < gameObjects.length; i++) {
                        if (trigger === gameObjects[i].leftBumper){
                            let steps = Math.abs((start) - gameObjects[i].leftBumper)/10;
                            return steps;
                        }
                    }
                    trigger += 10;
                }
                break;

            case 'up':
                while(trigger < 7200){
                    for(let i = 0; i < gameObjects.length; i++) {
                        if (trigger === gameObjects[i].upBumper){
                            let steps = Math.abs((start - 10) - gameObjects[i].upBumper)/10;
                            return steps;
                        }
                    }
                    trigger += 10;
                }
                break;

            case 'down':
                while(trigger < 7200){
                    for(let i = 0; i < gameObjects.length; i++) {
                        if (trigger === gameObjects[i].upBumper){
                            let steps = Math.abs((start - 10) - gameObjects[i].upBumper)/10;
                            return steps;
                        }
                    }
                    trigger += 10;
                }
                break;
        }
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
    let leftBumper = {x:self.x - 20, y:self.y};
    let rightBumper = {x:self.x + 20, y:self.y};
    let downBumper = {x:self.x, y:self.y + 40};
    let upBumper = {x:self.x, y:self.y - 40};

    let updateBumpers = function(){
        leftBumper = self.x - 20;
        rightBumper = self.x + 20;
        downBumper = self.y + 40;
        upBumper = self.y - 40;
    };

    self.moveLeft = function(steps_custom) {
        updateBumpers();
        let steps;
        if(steps_custom !== 0){
            steps = steps_custom;
        } else {
            steps = self.countSteps('left', rightBumper);
        }
        for(let i = 0; i < steps; i++) {
            // setInterval(function () {
                self.x -= self.maxSpd;
            // }, 40);
        }
    };

    self.moveRight = function(steps_custom){
        updateBumpers();
        let steps;
        if(steps_custom !== 0){
            steps = steps_custom;
        } else {
            steps = self.countSteps('right', leftBumper);
        }
        for(let i = 0; i < steps; i++) {
            // setInterval(function () {
                self.x += self.maxSpd;
            // }, 40);
        }
    };

    self.moveUP = function(steps_custom){
        updateBumpers();
        let steps;
        if(steps_custom !== 0){
            steps = steps_custom;
        } else {
            steps = self.countSteps('up', downBumper);
        }
        for(let i = 0; i < steps; i++) {
            // setInterval(function () {
                self.y -= self.maxSpd;
            // }, 40);
        }
    };
    self.moveDown = function(steps_custom){
        updateBumpers();
        let steps;
        if(steps_custom !== 0){
            steps = steps_custom;
        } else {
            steps = self.countSteps('down', upBumper);
        }
        for(let i = 0; i < steps; i++) {
            // setInterval(function () {
                self.y += self.maxSpd;
            // }, 40);

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

setTimeout(function screenUpdate() {
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    Maps.current.draw();
    player.update();
    let tick = setTimeout(screenUpdate, 40);
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
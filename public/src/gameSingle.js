let ctx = document.getElementById("game").getContext("2d");
let canvas = document.getElementById("canvas-wrapper");
ctx.font = '30px Arial';

//game
let Img = {};
Img.player = new Image();
Img.player.src = '../assets/monster.png';
Img.bullet = new Image();
Img.bullet.src = '../assets/monster.png';
Img.crystal = {};
Img.crystal['score'] = new Image();
Img.crystal['score'].src = '../assets/crystal_score.png';
Img.crystal['colorful'] = new Image();
Img.crystal['colorful'].src = '../assets/crystal_colorful.png';
Img.crystal['blue'] = new Image();
Img.crystal['blue'].src = '../assets/crystal_blue.png';
Img.crystal['green'] = new Image();
Img.crystal['green'].src = '../assets/crystal_green.png';
Img.crystal['red-black'] = new Image();
Img.crystal['red-black'].src = '../assets/crystal_red-black.png';
Img.map = new Image();
Img.map.src = '../assets/level_backgrounds/Level_1.png';

let socket = io();

let TILE_SIZE = 30;
let WIDTH = 1250;
let HEIGHT = 750;

let player;
let gameObjects = [];
let jumpObjects = [];
let crystals = [];
let doors = [];
let tooltipText = [];
tooltipText[0] = '  «Вітаємо тебе в дивовижному світі тролів в якому ти зможеш відкрити для себе щось нове і не відоме.' +
                    'Тобі доведеться спочатку прочитати теорію, щоб зрозуміти що робити.»';

tooltipText[1] = '  «JavaScript спочатку створювався для того, щоб зробити web-сторінки «живими». Програми на цій мові називаються скриптами. ' +
                        'У браузері вони підключаються безпосередньо до HTML і, як тільки завантажується сторінка - тут же виконуються. ' +
                        'Компіляція - це коли вихідний код програми, за допомогою спеціального інструменту, іншої програми, яка називається «компілятор», ' +
                        'перетворюється в іншу мову, як правило - в машинний код. Цей машинний код потім поширюється і запускається. ' +
                        'При цьому вихідний код програми залишається у розробника.»';

tooltipText[2] = "  «Тег script містить виконуваний код. Попередні стандарти HTML вимагали обовязкового зазначення атрибута type, але зараз він вже не потрібен. Досить просто '<'script'>'" +
                        "Браузер, коли бачить '<'script'>':" +
                        "1. Починає відображати сторінку, показує частину документа до script" +
                        "2. Зустрівши тег script, перемикається в JavaScript-режим і не показує, а виконує його вміст.";

let score = document.getElementById("crystalCounter");
let showingTooltip = 0;


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
            x,y,self.width*2,self.height*2
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
    let self = Entity(750,1000,30,5,50,70,Img.player,10,1);
    self.number = "" + Math.floor(10 * Math.random());
    self.bulletAngle = 0;
    self.maxSpd = 5 ;
    self.hpMax = 5;
    self.score = 0;
    let leftBumper = {x:self.x - self.maxSpd, y:self.y};
    let rightBumper = {x:self.x + self.maxSpd, y:self.y};
    let downBumper = {x:self.x, y:self.y + self.maxSpd};
    let upBumper = {x:self.x, y:self.y - self.maxSpd};

    let updateBumpers = function(){
        leftBumper = self.x - self.maxSpd;
        rightBumper = self.x + self.maxSpd;
        downBumper = self.y + 40;
        upBumper = self.y - 40;
    };

    let nearCrystal = function(){
        for(let i=0; i < crystals.length; i++){
            if(((self.x <= crystals[i].rightBumper) && (self.x >= crystals[i].leftBumper))
                && ((self.y >= crystals[i].upBumper) && (self.y <= crystals[i].downBumper))){
                return i;
            }
        }
        return false;
    };

    let endLevel = function(){
        for(let i=0; i < doors.length; i++){
            if(((self.x <= doors[i].rightBumper) && (self.x >= doors[i].leftBumper))
                && ((self.y >= doors[i].upBumper) && (self.y <= doors[i].downBumper))){
                console.log(i);
                return doors[i];
            }
        }
        return false;
    };

    let insideObject = function(){
        for(let i=0; i < gameObjects.length; i++){
            if(((self.x <= gameObjects[i].rightBumper) && (self.x >= gameObjects[i].leftBumper))
                && ((self.y >= gameObjects[i].upBumper) && (self.y <= gameObjects[i].downBumper))){
                return gameObjects[i];
            }
        }
        return false;
    };

    let insideObjectJump = function(){
        for(let i=0; i < jumpObjects.length; i++){
            if(((self.x <= jumpObjects[i].rightBumper) && (self.x >= jumpObjects[i].leftBumper))
                && ((self.y >= jumpObjects[i].upBumper) && (self.y <= jumpObjects[i].downBumper))){
                    return jumpObjects[i];
            }
        }
        return false;
    };

    let insideObjectHorizontal = function(){
        let inside = false;
        for(let i=0; i < gameObjects.length; i++){
            if(((self.x <= gameObjects[i].rightBumper-5) && (self.x >= gameObjects[i].leftBumper+5))
                && ((self.y >= gameObjects[i].upBumper) && (self.y <= gameObjects[i].downBumper))){
                inside = true;
                }
        }

        if((self.y < 965) && !inside){
            return false;
        }
        return true;
    };

    // self.moveLeft = function(a){
    //     self.x -= self.maxSpd;
    // };
    // self.moveRight = function(a){
    //     self.x += self.maxSpd;
    // };
    // self.moveUP = function(a){
    //     self.y -= self.maxSpd;
    // };
    // self.moveDown = function(a){
    //     self.y += self.maxSpd;
    // };
    self.moveLeft = function(steps_custom) {
        updateBumpers();
        let steps;

        if(steps_custom !== 0){
            steps = steps_custom;
        } else {
            steps = 1;
        }


        let timer = setInterval(function () {
            steps--;
            if(insideObjectHorizontal()) {
                self.x -= self.maxSpd;
                if (steps <= 0) {
                    clearInterval(timer);
                }
            }
            if (steps <= 0) {
                clearInterval(timer);
            }
        }, 40);

    };

    self.moveRight = function(steps_custom){
        updateBumpers();
        let steps;
        if(steps_custom !== 0){
            steps = steps_custom;
        } else {
            steps = 1;
        }

        let timer = setInterval(function () {
            steps--;
            if(insideObjectHorizontal()) {
                self.x += self.maxSpd;
                if (steps <= 0) {
                    clearInterval(timer);
                }
            }
                if (steps <= 0) {
                    clearInterval(timer);
                }
            }, 40);
    };

    self.moveUP = function(steps_custom){
        updateBumpers();
        let oldY = self.y;
        let steps;
        if(steps_custom !== 0){
            steps = steps_custom;
        } else {
            steps = 1;
        }
        let timer = setInterval(function () {
            steps --;
            let object = insideObject();
            if(object !== false) {
                if(self.y === object.upBumper+10){
                    clearInterval(timer);
                }
                self.y -= self.maxSpd;
            } else {
                clearInterval(timer);
                self.y = oldY;
            }
            if(steps <= 0){clearInterval(timer);}
        }, 40);
    };

    self.moveDown = function(steps_custom){
        updateBumpers();
        let oldY = self.y;
        let steps;
        if(steps_custom !== 0){
            steps = steps_custom;
        } else {
            steps = 1;
        }

        let timer = setInterval(function () {
            steps --;
            let object = insideObject();
            if(object !== false) {
                if(self.y === object.downBumper+10){
                    clearInterval(timer);
                }
                self.y += self.maxSpd;
            } else {
                clearInterval(timer);
                self.y = oldY;
            }
            if(steps <= 0){clearInterval(timer);}
        }, 40);
    };

    self.jumpUP = function(jump_height){
      if(jump_height <= 50){
          let heightUP = jump_height;
          let heightDown = jump_height;
          let timerJump = setInterval(function () {
              if (heightUP >= 0) {
                  heightUP--;
                  self.y -= self.maxSpd;
              } else {
                  if (insideObjectJump() !== false) {
                      clearInterval(timerJump);
                  }
                  heightDown--;
                  self.y += self.maxSpd;
                  if (heightDown <= 0) {
                      clearInterval(timerJump)
                  }
              }
          }, 40);
      }
    };

    self.jumpRight = function(jump_height, steps){
        if(jump_height <= 50 && steps <= 50) {
            let heightUP = jump_height;
            let heightDown = jump_height;
            let stepsUP = Math.trunc(steps / 2);
            let stepsDown = Math.trunc(steps / 2);
            let timerJumpRight = setInterval(function () {
                if (heightUP > 0) {
                    heightUP--;
                    self.y -= self.maxSpd;
                }
                if (stepsUP >= 0) {
                    stepsUP--;
                    self.x += self.maxSpd;
                }

                if (heightUP <= 0 && stepsUP <= 0) {
                    if (insideObjectJump() !== false) {
                        clearInterval(timerJumpRight);
                    }
                    if (self.y <= 1050) {
                        self.y += self.maxSpd;
                    } else {
                        clearInterval(timerJumpRight);
                    }
                    if (stepsDown >= 0) {
                        stepsDown--;
                        self.x += self.maxSpd;
                    }
                }
            }, 40);
        }
    };

    self.jumpLeft = function(jump_height, steps){
        if(jump_height <= 50 && steps <= 50) {
            let heightUP = jump_height;
            let heightDown = jump_height;
            let stepsUP = Math.trunc(steps / 2);
            let stepsDown = Math.trunc(steps / 2);
            let timerJumpRight = setInterval(function () {
                console.log(heightUP, stepsUP);
                if (heightUP > 0) {
                    heightUP--;
                    self.y -= self.maxSpd;
                }
                if (stepsUP >= 0) {
                    stepsUP--;
                    self.x -= self.maxSpd;
                }

                if (heightUP <= 0 && stepsUP <= 0) {
                    if (insideObjectJump() !== false) {
                        clearInterval(timerJumpRight);
                    }
                    if (self.y <= 1050) {
                        self.y += self.maxSpd;
                    } else {
                        clearInterval(timerJumpRight);
                    }
                    if (stepsDown >= 0) {
                        stepsDown--;
                        self.x -= self.maxSpd;
                    }
                }
            }, 40);
        }
    };

    self.takeCrystal = function(){
        let cryst = nearCrystal();
        if(cryst !== false){
            self.score++;
            crystals.splice(cryst, 1);
        } else {
            console.log("not in crystal");
        }
    };

    self.openDoor = function () {
        let door = endLevel();
        if(door !== false){
            showTooltip("CONGRATULATION", toolTipElem);
            // document.getElementById('btn-execute').addEventListener('click', function () {
            //     let script = document.getElementById("code").value;
            //
            //     let result = eval(script);
            // });
        } else {
            showTooltip('This is not the door', toolTipElem);
        }
    };

    return self;
};

player = new Player();

let ObjectParent = function (x, y, width, height, relativeX, relativeY) {
    let self = {
        x:x,
        y:y,
        height:height,
        width:width,
        rightBumper: Math.ceil((x + width/2)/10)*10,
        leftBumper: Math.ceil((x - width/2)/10)*10,
        upBumper: Math.ceil((y - height/2)/10)*10,
        downBumper: Math.ceil((y + height/2)/10)*10,
    };

    self.draw = function (){
        ctx.fillStyle = "green";
        ctx.strokeRect(self.x - player.x + relativeX, relativeY, self.width, self.height);
    };

    return self;
};

let Door = function(x, y, width, height, relativeX, relativeY){
    let self = new ObjectParent(x, y, width, height, relativeX, relativeY);
    return self;
};

doors[0] = new Door(7130, 690, 460, 710, 400, 30);

let JumpObject = function(x, y, width, height, relativeX, relativeY){
    let self = ObjectParent(x, y, width, height, relativeX, relativeY);
    return self;
};


//waredrobe 3375 810
//3345 705
//3495 705
//3630 705
jumpObjects[0] = new JumpObject(1330, 890, 350, 50, 450, 510);
jumpObjects[1] = new JumpObject(1830, 870, 460, 50, 400, 490);
jumpObjects[2] = new JumpObject(3000, 880, 350, 50, 450, 510);
jumpObjects[3] = new JumpObject(3220, 820, 50, 50, 580, 450);
jumpObjects[4] = new JumpObject(3495, 605, 430, 20, 410, 340);
jumpObjects[5] = new JumpObject(3495, 705, 430, 20, 410, 340);
jumpObjects[6] = new JumpObject(3495, 805, 430, 20, 410, 340);

let GameObject = function(x, y, width, height, relativeX, relativeY){
    let self = ObjectParent(x, y, width, height, relativeX, relativeY);
    return self;
};

gameObjects[0] = new GameObject(1310, 970, 460, 330, 420, 410);
gameObjects[1] = new GameObject(1830, 970, 460, 240, 400, 500);
gameObjects[2] = new GameObject(2410, 690, 660, 710, 300, 30);
gameObjects[3] = new GameObject(2990, 970, 460, 330, 400, 410);
gameObjects[4] = new GameObject(3860, 780, 1220, 680, 10, 100);
gameObjects[5] = new  GameObject(5540, 970, 880, 240, 170, 500);

//chest 750x1050
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


let Crystal = function(x, y, width, height, relativeX, relativeY, img){
    let self = new ObjectParent(x, y, width, height, relativeX, relativeY);
    self.img = img;

    self.draw = function (){
        ctx.drawImage(self.img, self.x - player.x + relativeX, relativeY, self.img.width, self.img.height);
        // ctx.fillStyle = "red";
        // ctx.strokeRect(self.x - player.x + relativeX, relativeY, self.width, self.height);
    };

    return self;
};

crystals[0] = new Crystal(1940, 800, 100, 130, 490, 380, Img.crystal['colorful']);
crystals[1] = new Crystal(3320, 450, 100, 100, 510, 70, Img.crystal['blue']);
crystals[2] = new Crystal(4370, 450, 100, 100, 510, 70, Img.crystal['green']);
crystals[3] = new Crystal(6900, 900, 200, 350, 480, 470, Img.crystal['red-black']);

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

Maps.current = Maps('level_1', Img.map.src, arrayCollision2D);

setTimeout(function screenUpdate() {
    // let positionInfo = canvas.getBoundingClientRect();
    // WIDTH = positionInfo.width;
    // HEIGHT = positionInfo.height;
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    Maps.current.draw();
    // for(let i=0; i < gameObjects.length; i++){
    //     gameObjects[i].draw();
    // }
    // for(let i=0; i < jumpObjects.length; i++){
    //     jumpObjects[i].draw();
    // }
    for(let i=0; i < crystals.length; i++){
        crystals[i].draw();
    }
    // for(let i=0; i < doors.length; i++){
    //     doors[i].draw();
    // }
    player.update();
    drawScore();
    let tick = setTimeout(screenUpdate, 40);
}, 40);

let lastScore = null;
let drawScore = function () {
    if(lastScore === Player.score)
        return;
    score.innerText = player.score;
};


let showTooltip = function (text) {
    alert(text);
    let tooltip = document.getElementById('tooltipText');
    tooltip.value = text;
    // document.getElementById('tooltip').style.display = 'none';
};

let Showed = 0;
document.getElementById('btn_tooltip_n').onclick = function (e) {
    Showed++;
    showTooltip(tooltipText[Showed]);
};

document.onkeydown = function(event){
    if(event.keyCode === 68)    //d
        player.moveRight(10);
    else if(event.keyCode === 83)   //s
        player.moveDown(10);
    else if(event.keyCode === 65) //a
        player.moveLeft(10);
    else if(event.keyCode === 87) // w
        player.moveUP(10);
};

document.getElementById('game').onclick = function(e) {
    console.log("player: ", player.x, player.y);
};

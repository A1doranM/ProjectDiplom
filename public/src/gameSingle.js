let ctx = document.getElementById("game").getContext("2d");
ctx.font = '30px Arial';

//game
let Img = {};
Img.player = new Image();
Img.player.src = '../assets/player.png';
Img.bullet = new Image();
Img.bullet.src = '../assets/bullet.png';

Img.map = {};
Img.map['field'] = new Image();
Img.map['field'].src = '../assets/map.png';
Img.map['forest'] = new Image();
Img.map['forest'].src = '../assets/map2.png';

let socket = io();

let WIDTH = 750;
let HEIGHT = 750;

let player;

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
        map: 'forest',
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
        let y = self.y - player.y + HEIGHT/2;

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
    let self = Entity(50,40,30,5,50,70,Img.player,10,1);
    self.number = "" + Math.floor(10 * Math.random());
    self.bulletAngle = 0;
    self.maxSpd = 10;
    self.hpMax = 5;
    self.score = 0;

    self.moveLeft = function(){
        self.x += -self.maxSpd;
    };
    self.moveRight = function(){
        self.x += self.maxSpd;
    };
    self.moveUP = function(){
        self.y += -self.maxSpd;
    };
    self.moveDown = function(){
        self.y += self.maxSpd;
    };
    // self.shoot = function () {
    //     for(let i = -3; i < 3; i++){
    //         self.shootBullet(i * 10 + self.angle);
    //     }
    //     self.shootBullet(self.bulletAngle);
    // };

    // self.shootBullet = function(angle){
    //     Bullet({
    //         parent:self.id,
    //         angle:angle,
    //         x:self.x,
    //         y:self.y,
    //         map:self.map,
    //     });
    // };
    return self;
};

// let Bullet = function(param){
//     let self = Entity(param);
//     self.id = Math.random();
//     self.angle = param.angle;
//     self.spdX = Math.cos(param.angle/180*Math.PI) * 10;
//     self.spdY = Math.sin(param.angle/180*Math.PI) * 10;
//     self.timer = 0;
//     self.parent = param.parent;
//     self.toRemove = false;
//
//     let super_update = self.update;
//     self.update = function(){
//         if(self.timer++ > 100)
//             self.toRemove = true;
//         super_update();
//
//         for(let i in Player.list){
//             let p = Player.list[i];
//             if((self.map === p.map) && (self.getDistance(p) < 32) && (self.parent !== p.id)){
//                 p.hp -= 1;
//
//                 if(p.hp <= 0){
//                     let shooter = Player.list[self.parent];
//                     if(shooter){
//                         shooter.score += 1;
//                     }
//                     p.hp = p.hpMax;
//                     p.x = Math.random() * 500;
//                     p.y = Math.random() * 500;
//
//                 }
//
//                 self.toRemove = true;
//             }
//         }
//     };
//
//     self.getInitPackage = function(){
//         return{
//             id:self.id,
//             x:self.x,
//             y:self.y,
//             map:self.map,
//         };
//     };
//
//     self.getUpdatePackage = function(){
//         return{
//             id:self.id,
//             x:self.x,
//             y:self.y,
//         };
//     };
//
//     Bullet.list[self.id] = self;
//     initPackage.bullet.push(self.getInitPackage());
//     return self;
// };
//
// Bullet.list = {};
//
// Bullet.update = function(){
//     let pack = [];
//
//     for(let i in Bullet.list){
//         let bullet = Bullet.list[i];
//         bullet.update();
//         if(bullet.toRemove){
//             delete Bullet.list[i];
//             removePackage.bullet.push(bullet.id);
//         } else {
//             pack.push(bullet.getUpdatePackage());
//         }
//     }
//     return pack;
// };
//
// Bullet.getAllInitPacks = function() {
//     let bullets = [];
//     for (let i in Bullet.list) {
//         bullets.push(Bullet.list[i].getInitPackage());
//     }
//     return bullets;
// };

player = new Player();

let drawMap = function () {
    let x = WIDTH/2 - player.x;
    let y = HEIGHT/2 - player.y;
    ctx.drawImage(Img.map['forest'],0,0,Img.map['forest'].width,Img.map['forest'].height,x,y,Img.map['forest'].width*2,Img.map['forest'].height*2)
};

// let lastScore = null;
// let drawScore = function () {
//     if(lastScore === Hero.score)
//         return;
//     ctx.fillStyle = 'white';
//     ctx.fillText(Hero.score, 0, 30);
// };

setInterval(function () {
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    drawMap();
    player.update();
    // Bullet.draw();
}, 40);

function Run () {
    let script = document.getElementById("code").value;
    eval(script);
}

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

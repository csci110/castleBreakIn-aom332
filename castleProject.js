import { game, Sprite } from "./sgc/sgc.js";
game.setBackground("grass.png");

class Wall extends Sprite {
    constructor(x, y, name, image) {
        super();

        this.x = x;
        this.y = y;
        this.name = name;
        this.setImage(image);
        this.accelerateOnBounce = false;

    }
}
new Wall(0, 0, "A spooky castle wall", "castle.png");

let leftWall = new Wall(0, 200, "Left side wall", "wall.png");


let rightWall = new Wall(game.displayWidth - 48, 200, "Right side wall", "wall.png");

class Princess extends Sprite {
    constructor() {
        super();
        this.name = "Princess Ann";
        this.setImage("ann.png");
        this.height = 48;
        this.width = 48;
        this.x = game.displayWidth / 2;
        this.y = game.displayHeight - this.height;
        this.speedWhenWalking = 250;
        this.accelerateOnBounce = false;
        this.defineAnimation("left", 9, 11);
        this.defineAnimation("right", 3, 5);
        this.lives = 3;

    }
    handleLeftArrowKey() {
        this.playAnimation("left");
        this.speed = this.speedWhenWalking;
        this.angle = 180;
    }
    handleRightArrowKey() {
        this.playAnimation("right");
        this.speed = this.speedWhenWalking;
        this.angle = 0;
    }
    handleCollision(otherSprite) {
        // Horizontally, Ann's image file is about one-third blank, one-third Ann, and         // one-third blank.
        // Vertically, there is very little blank space. Ann's head is about one-fourth         // the height.
        // The other sprite (Ball) should change angle if:
        // 1. it hits the middle horizontal third of the image, which is not blank, AND
        // 2. it hits the upper fourth, which is Ann's head.
        let horizontalOffset = this.x - otherSprite.x;
        let verticalOffset = this.y - otherSprite.y;
        if (Math.abs(horizontalOffset) < this.width / 3 &&
            verticalOffset > this.height / 4) {
            // The new angle depends on the horizontal difference between sprites.
            otherSprite.angle = 90 + 2 * horizontalOffset;
        }
        return false;
    }

    updateLivesDisplay() {
        game.writeToTextArea(this.livesDisplay, "Lives = " + this.lives);
    }

    handleGameLoop() {
        this.x = Math.max(this.x);
        this.y = Math.min(552, this.y);
        this.speed = 0;
    }

    handleFirstGameLoop() {
        // Set up a text area to display the number of lives remaining.
        this.livesDisplay = game.createTextArea(game.displayWidth - 3 * 48, 20);
        this.updateLivesDisplay();
        game.writeToTextArea(this.livesDisplay, "Lives = " + this.lives);
    }
    loseALife() {
        this.lives = this.lives - 1;
        this.updateLivesDisplay();
        if (this.lives > 0) {
            new Ball();
        }
        if (this.lives <= 0) {
            game.end('The mysterious stranger has escaped\nPrincess Ann for ' +
                'now!\n\Better luck next time.');

        }
    }
    addALife() {
        this.lives = this.lives + 1;
        this.updateLivesDisplay();
    }
}
let ann = new Princess();

class Ball extends Sprite {
    constructor(x, y, name, image) {
        super();
        this.x = game.displayWidth / 2;
        this.y = game.displayHeight / 2;
        this.height = 48;
        this.width = 48;
        this.name = "Ball";
        this.setImage("ball.png");
        this.defineAnimation("spin", 0, 12);
        this.speed = 150;
        this.angle = 50 + Math.random() * 80;
        this.playAnimation("spin", true);
        Ball.ballsInPlay = Ball.ballsInPlay + 1;
    }
    handleGameLoop() {
        if (this.speed < 200) {
            this.speed = this.speed + 2;
        }

    }
    handleBoundaryContact() {
        game.removeSprite(this);
        Ball.ballsInPlay = Ball.ballsInPlay - 1;
        if (Ball.ballsInPlay <= 0) {
            ann.loseALife();
        }
    }
}
Ball.ballsInPlay = 0;
new Ball(360, 90, "ball", "ball.png");

class Block extends Sprite {
    constructor(x, y) {
        super(x, y);
        this.x = x;
        this.y = y;
        this.name = "Ball Traps";
        this.setImage("block1.png");
        this.accelerateOnBounce = false;

        Block.blocksToDestroy =
            Block.blocksToDestroy + 1;
    }
    handleCollision() {
        game.removeSprite(this);
        Block.blocksToDestroy = Block.blocksToDestroy - 1;
        if (Block.blocksToDestroy <= 0) {
            game.end('Congratulations!\n\nPrincess Ann can continue' +
                'her pursuit\nof the mysterious stranger!');
            this.true;
        }
    }
}
Block.blocksToDestroy = 0;

for (let i = 0; i < 5; i = i + 1) {
    new Block(200 + i * 48, 200);
}

class ExtraLifeBlock extends Block {
    constructor(x, y) {
        super(x, y);
        this.setImage("block2.png");
        Block.blocksToDestroy = Block.blocksToDestroy - 1;

    }
    handleCollision() {
        ann.addALife();
        return true;

    }
}
new ExtraLifeBlock(200, 350);

class ExtraBallBlock extends Block {
    constructor(x, y) {
        super(x, y);
        this.setImage("block3.png");

    }
    handleCollision() {
        super.handleCollision(); // call function in superclass
        new Ball(); // extend superclass behavior
        return true;
    }
}
new ExtraBallBlock(300, 350);

class ExplodingBlock extends Block {
    constructor(x, y) {
        super(x, y);
        this.setImage("block3.png");
    }
    handleCollision() {
        super.handleCollision();
        new Fireball(this);
    }
}
new ExplodingBlock(500, 250);

class Fireball extends Block {
    constructor(deadSprite) {
        super();
        this.x = deadSprite.x;
        this.y = deadSprite.y;
        this.setImage("fireballSheet.png");
        this.name = ("A ball of fire");
        this.deadSprite = game.removeSprite(deadSprite);
        this.defineAnimation("explode", 0, 7);
        this.playAnimation("explode");

    }
    handleAnimationEnd() {
        game.removeSprite(this);
    }
}
class SpeedBlock extends Block {
    constructor(x, y) {
        super(x, y);
        this.setImage("block2.png");
    }
    handleCollision() {
        Block.blocksToDestroy = Block.blocksToDestroy - 1;
        new Ball();
        Ball.speed = 450;
    }
}
new SpeedBlock(500, 450);

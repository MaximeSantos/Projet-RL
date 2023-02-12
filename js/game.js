const game = {

    canvas:null,
    ctx:null,

    ts: 64,
    numTiles: 9,
    uiWidth: 4,

    x: 0,
    y: 0,
    


    init: function(){
        game.addEventListeners();
        game.setupCanvas();
        setInterval(game.draw, 15);
    },

    addEventListeners: function(){
        document.querySelector('html').addEventListener('keypress', game.handleKeyPresses);
    },

    setupCanvas: function () {
        game.canvas = document.querySelector("canvas");
        game.ctx = game.canvas.getContext("2d");

        game.canvas.width = game.ts*(game.numTiles+game.uiWidth);
        game.canvas.height = game.ts*game.numTiles;

        game.canvas.style.width = game.canvas.width + 'px';
        game.canvas.style.height = game.canvas.height + 'px';

        game.ctx.imageSmoothingEnabled = false;
    },

    draw: function () {
        game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        // game.ctx.fillRect(game.x*game.ts, game.y*game.ts, game.ts, game.ts);
        game.drawSprite(0, game.x, game.y)
    },

    drawSprite: function (sprite, x, y) {
        game.ctx.drawImage(
            spritesheet,
            sprite*16,
            0,
            16,
            16,
            x*game.ts,
            y*game.ts,
            game.ts,
            game.ts
        );
    },

    handleKeyPresses: function (e) {
        if(e.key=="z") game.y--;
        if(e.key=="s") game.y++;
        if(e.key=="q") game.x--;
        if(e.key=="d") game.x++;
    },
};

document.addEventListener('DOMContentLoaded', game.init);

spritesheet = new Image();
spritesheet.src = './img/BroughlikeSpritesheet.png';

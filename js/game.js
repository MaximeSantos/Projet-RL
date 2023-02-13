const game = {

    canvas:null,
    ctx:null,

    ts: 64,
    numTiles: 9,
    uiWidth: 4,

    x: 0,
    y: 0,

    startingTile:null,

    init: function(){
        game.addEventListeners();
        game.setupCanvas();
        setInterval(game.draw, 15);
        map.generateLevel();

        // we get a passableTile for the player's starting point
        game.startingTile = map.randomPassableTile();
        game.x = game.startingTile.x;
        game.y = game.startingTile.y;
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
        // clearing the board
        game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);

        // drawing the map
        for(let i=0; i<game.numTiles; i++){
            for(let j=0; j<game.numTiles; j++){
                map.getTile(i,j).draw();
            }
        }

        // drawing the player
        game.drawSprite(0, game.x, game.y)
    },

    // premier argument = fichier à afficher
    // 4 suivants = restreint quelle partie du fichier afficher
    // 4 suivants = classiques du drawImage/fillRect
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

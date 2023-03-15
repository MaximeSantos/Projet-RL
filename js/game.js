const game = {

    canvas:null,
    ctx:null,

    ts: 64,
    numTiles: 9,
    uiWidth: 4,

    level: 1,

    player:null,

    startingTile:null,

    init: function(){
        game.addEventListeners();
        game.setupCanvas();
        setInterval(game.draw, 15);
        map.generateLevel();

        // we get a passableTile for the player's starting point
        game.player = new Player(map.randomPassableTile());
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

        // drawing the monsters
        for(let i = 0; i<map.monsters.length; i++){
            map.monsters[i].draw();
        }


        // drawing the player
        game.player.draw();
    },

    // updates the world aned the monsters in it
    tick: function(){
        // we reverse the loop so that we can splice them out of the array safely if they are dead
        for(let k = map.monsters.length-1; k >= 0; k--){
            if(!map.monsters[k].dead){
                map.monsters[k].update();
            }else{
                map.monsters.splice(k,1);
            }
        }
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
        if(e.key=="z") game.player.tryMove(0, -1);
        if(e.key=="s") game.player.tryMove(0, 1);
        if(e.key=="q") game.player.tryMove(-1, 0);
        if(e.key=="d") game.player.tryMove(1, 0);
    },
};

document.addEventListener('DOMContentLoaded', game.init);

spritesheet = new Image();
spritesheet.src = './img/BroughlikeSpritesheet.png';

const game = {
    canvas:null,
    ctx:null,

    ts: 64,
    numTiles: 9,
    uiWidth: 4,
    level: 1,
    maxHp: 6,

    startingHp: 3,
    numLevels: 6,

    player:null,
    startingTile:null,

    gameState: "loading",

    init: function(){
        game.addEventListeners();
        game.setupCanvas();
        setInterval(game.draw, 15);
    },

    addEventListeners: function(){
        document.querySelector('html').addEventListener('keypress', game.handleKeyPresses);
        spritesheet.addEventListener('load', game.showTitle); // test
    },

    setupCanvas: function (){
        game.canvas = document.querySelector("canvas");
        game.ctx = game.canvas.getContext("2d");

        game.canvas.width = game.ts*(game.numTiles+game.uiWidth);
        game.canvas.height = game.ts*game.numTiles;

        game.canvas.style.width = game.canvas.width + 'px';
        game.canvas.style.height = game.canvas.height + 'px';

        game.ctx.imageSmoothingEnabled = false;
    },

    draw: function (){
        if(game.gameState == "running" || game.gameState == "dead"){
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

            game.drawText("Level: " + game.level, 30, false, 40, "violet")
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

    drawText: function (text, size, centered, textY, color){
        // set color & size
        game.ctx.fillStyle = color;
        game.ctx.font = size + "px monospace";
        // centered argument allows us to choose where to place the text on the X axis
        // if centered then it will be for the title screen
        // if not, then this will be for our UI while the game is running
        let textX;
        if(centered){
            textX = (game.canvas.width - game.ctx.measureText(text).width)/2; // bit of a workaround to get the center while using the canvas. Might go for some easy HTML/CSS later instead
        }else{
            textX = game.canvas.width - game.uiWidth * game.ts + 25;
        }

        game.ctx.fillText(text, textX, textY);
    },

    // updates the world aned the monsters in it
    // sets gameState if player is dead
    tick: function(){
        // make monsters act if alive, take them out of the list of monsters if dead
        for(let k = map.monsters.length-1; k >= 0; k--){ // we reverse the loop so that we can splice monsters out of the array safely if they are dead
            if(!map.monsters[k].dead){
                map.monsters[k].update();
            }else{
                map.monsters.splice(k,1);
            }
        }

        // change state if player is dead
        if(game.player.dead){
            game.gameState = "dead";
        }

        map.spawnCounter--;
        if(map.spawnCounter <= 0){
            map.spawnMonster();
            map.spawnCounter = map.spawnRate;
            map.spawnRate--;
        }
    },

    showTitle: function(){
        game.ctx.fillStyle = 'rgba(0, 0, 0, .75)';
        game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

        game.gameState = "title";

        game.drawText("CROWGUE - LIKE", 70, true, game.canvas.height/2 - 110, "white");
        game.drawText("A test project", 20, true, game.canvas.height/2 - 20, "white");
    },

    startGame: function(){
        game.level = 1;
        game.startLevel(game.startingHp);

        game.gameState = "running";
    },

    
    startLevel: function(playerHp){
        map.spawnRate = 15;                 // TODO we could change this value to adjust difficulty
        map.spawnCounter = map.spawnRate;

        map.generateLevel();

        game.player = new Player(map.randomPassableTile());
        game.player.hp = playerHp;

        map.randomPassableTile().replace(Exit);
    },

    handleKeyPresses: function (e) {
        if(game.gameState == "title"){
            game.startGame();
        }else if(game.gameState == "dead"){
            game.showTitle();
        }else if(game.gameState == "running"){
            if(e.key=="z") game.player.tryMove(0, -1);
            if(e.key=="s") game.player.tryMove(0, 1);
            if(e.key=="q") game.player.tryMove(-1, 0);
            if(e.key=="d") game.player.tryMove(1, 0);
            if(e.key==" ") game.player.wait();
        }
    },
};

document.addEventListener('DOMContentLoaded', game.init);

spritesheet = new Image();
spritesheet.src = './img/BroughlikeSpritesheet.png';
// spritesheet.onload = showTitle;

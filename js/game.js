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
    numSpells: null,
    nbTreasures: 3,
    score: null,

    player: null,
    startingTile:null,

    gameState: "loading",

    shakeAmount: 0,
    shakeX: 0,
    shakeY: 0,
    
    // TODO Add more information on how to play the game on the page
    // TODO add a button so that the player can reset the run himself without having to refresh
    
    init: function(){
        game.addEventListeners();
        game.setupCanvas();
        setInterval(game.draw, 15);
    },

    addEventListeners: function(){
        document.querySelector('html').addEventListener('keypress', game.handleKeyPresses);
        spritesheet.addEventListener('load', game.showTitle);
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

            game.screenshake();
    
            // drawing the map
            for(let i=0; i<game.numTiles; i++){
                for(let j=0; j<game.numTiles; j++){
                    map.getTile(i,j).draw();
                }
            }
    
            // drawing the monsters
            for(let i = 0, len=map.monsters.length; i < len; i++){
                map.monsters[i].draw();
            }
    
            // drawing the player
            game.player.draw();

            // drawing the UI
            game.drawText("Level: " + game.level, 30, false, 40, "violet");
            game.drawText("Score: " + game.score, 30, false, 70, "violet");

            for(let i = 0, len = game.player.spells.length; i < len; i++){
                let spellText = (i + 1) + ") " + (game.player.spells[i] || "");
                game.drawText(spellText, 20, false, 110 + i * 40, "aqua");
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
            x*game.ts + game.shakeX,
            y*game.ts + game.shakeY,
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

    drawScore: function(){
        let scores = game.getScores();
        if(scores.length){
            game.drawText(
                util.rightPad(["RUN", "SCORE", "TOTAL"]),
                18,
                true,
                game.canvas.height / 2,
                "white"
            );

            let newestScore = scores.pop();
            scores.sort(function(a,b){
                return b.totalScore - a.totalScore;
            });
            scores.unshift(newestScore);

            for(let i = 0, len = Math.min(10, scores.length); i < len; i++){
                let scoreText = util.rightPad([scores[i].run, scores[i].score, scores[i].totalScore]);
                game.drawText(
                    scoreText,
                    18,
                    true,
                    game.canvas.height / 2 + 24 + i * 24,
                    i == 0 ? "aqua" : "violet"
                );
            }
        }
    },

    // this function allows us to add our score to LS in two cases : if we won or if we lost
    // we add to ability to have win streaks, allowing us to add up our scores from our win streaks
    addScore: function(score, won){
        // retrieves our scores from localstorage
        let scores = game.getScores();
        // create an objet of our current score
        let scoreObject = {
            score: game.score,
            run: 1,
            totalScore: game.score,
            active: won
        };
        // we retrieve last score (will be active if it got added from a win)
        let lastScore = scores.pop();

        // if our last run was a win, we add both scores together to reward win streaks
        if(lastScore){
            if(lastScore.active){
                scoreObject.run = lastScore.run + 1;
                scoreObject.totalScore += lastScore.totalScore;
            }else{
                // else we juste put back score from last game
                scores.push(lastScore);
            }
        }
        // add our new score to our array
        scores.push(scoreObject);

        // add our add back to localstorage
        localStorage["scores"] = JSON.stringify(scores);
    },

    // if there are scores in localstorage return that else return empty array
    getScores: function(){
        if(localStorage["scores"]){
            return JSON.parse(localStorage["scores"]);
        }else{
            return [];
        }
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
            game.addScore(game.score, false);

            game.gameState = "dead";
        }

        map.spawnCounter--;
        if(map.spawnCounter <= 0){
            map.spawnMonster();
            map.spawnCounter = map.spawnRate;
            map.spawnRate--;
        }
    },

    screenshake: function(){
        if(game.shakeAmount){ // as long a game.shakeAmount > 0
            game.shakeAmount--;
        }
        // trigonometry
        let shakeAngle = Math.random() * Math.PI * 2;
        game.shakeX = Math.round(Math.cos(shakeAngle) * game.shakeAmount);
        game.shakeY = Math.round(Math.sin(shakeAngle) * game.shakeAmount);
    },

    showTitle: function(){
        game.ctx.fillStyle = 'rgba(0, 0, 0, .75)';
        game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

        game.gameState = "title";

        game.drawText("CROWGUE - LIKE", 70, true, game.canvas.height/2 - 150, "white");
        game.drawText("A test project", 20, true, game.canvas.height - 20, "white");

        game.drawScore();
    },

    startGame: function(){
        game.level = 1;
        game.score = 0;
        game.numSpells = 9;

        game.startLevel(game.startingHp);

        game.gameState = "running";
    },

    
    startLevel: function(playerHp){
        map.monsters = [];
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

            if(e.key >= 1 && e.key <= 9) game.player.castSpell(e.key - 1);
        }
    },
};

document.addEventListener('DOMContentLoaded', game.init);

spritesheet = new Image();
spritesheet.src = './img/BroughlikeSpritesheet.png';
// spritesheet.onload = showTitle;

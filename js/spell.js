spells = {
    // teleports the player to a random floor tile
    WOOP: function(){
        game.player.move(map.randomPassableTile());
    },

    // hurts every monster close to a wall (including the player)
    QUAKE: function(){
        for(let i = 0; i < game.numTiles; i++){
            for(let j = 0; j < game.numTiles; j++){
                let tile = map.getTile(i,j);
                if(tile.monster){
                    let numWalls = 4 - tile.getAdjacentPassableNeighbors().length;
                    tile.monster.hit(numWalls * 2);
                }
            }
        }
        game.shakeAmount = 20;
    },

    CHAOS: function(){
        for(let i = 0, mlen = map.monsters.length; i < mlen; i++){
            map.monsters[i].move(map.randomPassableTile());
            map.monsters[i].teleportCounter = 2;
        }
    },
}
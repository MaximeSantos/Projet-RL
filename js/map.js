map = {
    tiles: [],

    generateLevel: function() {
        // map.generateTiles();
        util.tryTo('generate map', function(){
            return map.generateTiles() == map.randomPassableTile().getConnectedTiles().length;
        });
    },

    generateTiles: function() {
        let passableTiles = 0;

        for(let i=0; i<game.numTiles; i++){
            map.tiles[i] = [];
            for(let j=0; j<game.numTiles; j++){
                if(Math.random() < 0.3 || !map.inBounds(i,j)) {
                    map.tiles[i][j] = new Wall(i,j);
                }else{
                    map.tiles[i][j] = new Floor(i,j);
                    passableTiles++;
                }
            }
        }
        return passableTiles;
    },

    inBounds: function(x,y) {
        return x>0 && y>0 && x<game.numTiles-1 && y<game.numTiles-1;
    },

    getTile: function(x,y) {
        if(map.inBounds(x,y)){
            return map.tiles[x][y];
        }else{
            return new Wall(x,y);
        }
    },

    randomPassableTile: function() {
        let tile;
        util.tryTo('get random passable tile', function(){
            let x = util.randomRange(0, game.numTiles-1);
            let y = util.randomRange(0, game.numTiles-1);
            tile = map.getTile(x,y);
            return tile.passable && !tile.monster;
        });
        return tile;
    }
}

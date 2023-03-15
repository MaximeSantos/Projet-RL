class Tile {
    constructor (x, y, sprite, passable){
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.passable = passable;
    }

    //manhattan distance
    dist(other){
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    // getNeighbor, getAdjacentNeighbors, getAdjacentPassableNeighbors and getConnectedTiles are needed for our flood fill
    // => https://en.wikipedia.org/wiki/Flood_fill

    //getNeigbor is a wrapper around map.getTile
    getNeighbor(dx, dy){
        return map.getTile(this.x + dx, this.y + dy)
    }

    // returns the shuffled adjacent neighbors of a tile thanks to getNeighbor
    getAdjacentNeighbors(){
        return util.shuffle([
            this.getNeighbor(0, -1),
            this.getNeighbor(0, 1),
            this.getNeighbor(-1, 0),
            this.getNeighbor(1, 0)
        ])
    }

    // this filters out all non-passable neighbors of a tile
    getAdjacentPassableNeighbors(){
        return this.getAdjacentNeighbors().filter(t =>t.passable);
    }

    
    /*
        create a list of tiles to check for connectedness
        create a list of connected tiles

        add a single random passable tile to both lists

        while there are more tiles to check...
            pick one
            get its neighbors
            filter out the walls
            filter out the tiles we've already found were connected
            add the filtered neighbors to a list of connected tiles and to the tiles that need to be checked

        return the list of connected tiles
    */
    getConnectedTiles(){
        let connectedTiles = [this];
        let frontier = [this];
        while(frontier.length){
            let neighbors = frontier.pop()
                                    .getAdjacentPassableNeighbors()
                                    .filter(t => !connectedTiles.includes(t));
            connectedTiles = connectedTiles.concat(neighbors);
            frontier = frontier.concat(neighbors);
        }
        return connectedTiles;
    }

    // draw the tile
    draw(){
        game.drawSprite(this.sprite, this.x, this.y);
    }
}

class Floor extends Tile {
    constructor (x, y){
        super(x, y, 2, true);
    };
}

class Wall extends Tile {
    constructor (x, y){
        super(x, y, 3, false);
    };
}
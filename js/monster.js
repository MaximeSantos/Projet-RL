class Monster {
    constructor(tile, sprite, hp){
        this.move(tile);
        this.sprite = sprite;
        this.hp = hp;
    }

    update(){
        this.doStuff();
    }

    doStuff(){
        // we look for tiles that are either empty and can be moved to or the player so it can be attacked
        let neighbors = this.tile.getAdjacentPassableNeighbors();
        neighbors = neighbors.filter(t => !t.monster || t.monster.isPlayer);

        if(neighbors.length){
            neighbors.sort((a,b) => a.dist(game.player.tile) - b.dist(game.player.tile));
            let newTile = neighbors[0];
            this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
        }
    }

    draw(){
        game.drawSprite(this.sprite, this.tile.x, this.tile.y);
    }

    // for now we only allow to move if tile is passable and has no monster on it
    // we will later add the possibility to attack
    tryMove(dx, dy){
        let newTile = this.tile.getNeighbor(dx, dy);
        if(newTile.passable){
            if(!newTile.monster){
                this.move(newTile);
            }
            return true;
        }
    }

    // we remove monster from previous tile and add it to the new tile
    move(tile){
        if(this.tile){
            this.tile.monster = null;
        }
        this.tile = tile;
        tile.monster = this;
    }
}

class Player extends Monster {
    constructor(tile){
        super(tile, 0, 3);
        this.isPlayer = true;
    }

    // we override the method in Monster
    tryMove(dx, dy){
        // if the move is succesfull (no bumping into wall for example) -- tick() triggers
        if(super.tryMove(dx,dy)){
            game.tick();
        }
    }
}


class Blobby extends Monster{
    constructor(tile){
        super(tile, 4, 3);
    }
}


class Blocky extends Monster{
    constructor(tile){
        super(tile, 5, 1);
    }
}


class Sticky extends Monster{
    constructor(tile){
        super(tile, 6, 2);
    }
}


class Biggy extends Monster{
    constructor(tile){
        super(tile, 7, 1);
    }
}


class Snaky extends Monster{
    constructor(tile){
        super(tile, 8, 2);
    }
}
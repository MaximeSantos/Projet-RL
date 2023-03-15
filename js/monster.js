class Monster {
    constructor(tile, sprite, hp){
        this.move(tile);
        this.sprite = sprite;
        this.hp = hp;
    }

    // monsters can heal but wont exceed a maxHp property set in game.js
    heal(damage){
        this.hp = Math.min(game.maxHp, this.hp + damage);
    }

    update(){
        if(this.stunned){
            this.stunned = false;
            return
        }

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

        this.drawHp();
    }

    // Hp pips are drawn left to write, offset by 5 pixels each and then stacked vertically offset by 5 pixels each row
    drawHp(){
        for(let i = 0; i < this.hp; i++){
            game.drawSprite(
                9,
                this.tile.x + (i%3) * (5/16),
                this.tile.y - Math.floor(i/3) * (5/16)
            );
        }
    }

    // we only allow to move if tile is passable and has no monster on it
    // monsters can attack the player
    tryMove(dx, dy){
        let newTile = this.tile.getNeighbor(dx, dy);
        if(newTile.passable){
            if(!newTile.monster){
                this.move(newTile);
            }else{
                if(this.isPlayer != newTile.monster.isPlayer){

                    this.attackedThisTurn = true;

                    newTile.monster.stunne = true;

                    newTile.monster.hit(1);
                }
            }
            return true;
        }
    }

    // taking damage
    hit(damage){
        this.hp -= damage;
        if(this.hp <= 0){
            this.die();
        }
    }

    // this only applies to the player since monsters disappear when they die
    die(){
        this.dead = true;
        this.tile.monster = null;
        this.sprite = 1; // sprite of dead-player
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

    wait(){
        game.tick();
    }
}

// default monster
class Blobby extends Monster{
    constructor(tile){
        super(tile, 4, 3);
    }
}

// can only act once every two turns
class Blocky extends Monster{
    constructor(tile){
        super(tile, 5, 1);
    }

    update(){
        let startedStunned = this.stunned;
        super.update();
        if(!startedStunned){
            this.stunned = true;
        }
    }
}

// can move twice (but attack once)
class Sticky extends Monster{
    constructor(tile){
        super(tile, 6, 2);
    }

    doStuff(){
        this.attackedThisTurn = false;
        super.doStuff();

        if(!this.attackedThisTurn){
            super.doStuff();
        }
    }
}

// can eat walls to regen HPs
class Biggy extends Monster{
    constructor(tile){
        super(tile, 7, 1);
    }

    // we check for nearby walls that are not outer walls -- and eat one if there are any, transforming it into a floor and restoring health to the monster
    doStuff(){
        let neighbors = this.tile.getAdjacentPassableNeighbors().filter(t => !t.passable && map.inBounds(t.x, t.y));

        if(neighbors.length){
            neighbors[0].replace(Floor);
            this.heal(0.5);
        }else{
            super.doStuff();
        }
    }

}

// moves randomly
class Snaky extends Monster{
    constructor(tile){
        super(tile, 8, 2);
    }

    doStuff(){
        let neighbors = this.tile.getAdjacentPassableNeighbors();
        if(neighbors.length){
            this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
        }
    }
}
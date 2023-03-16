class Monster {
    constructor(tile, sprite, hp){
        this.move(tile);
        this.sprite = sprite;
        this.hp = hp;
        this.teleportCounter = 2;

        this.offsetX = 0;
        this.offsetY = 0;
    }

    // monsters can heal but wont exceed a maxHp property set in game.js
    heal(damage){
        this.hp = Math.min(game.maxHp, this.hp + damage);
    }

    update(){
        // if(this.teleportCounter > 0) this.teleportCounter--;
        if(this.teleportCounter--); // decrements the counter until it reaches 0 where it will evaluate as false

        // do nothing if the monster is either stunned or teleporting in
        if(this.stunned || this.teleportCounter > 0){
            this.stunned = false;
            return
        }

        this.doStuff();
    }

    doStuff(){
        // we look for tiles that are either empty and can be moved to or the player so it can be attacked
        let neighbors = this.tile.getAdjacentPassableNeighbors();
        neighbors = neighbors.filter(t => !t.monster || t.monster.isPlayer);

        // by default monsters will try to go after the player using the manhattan distance
        if(neighbors.length){
            neighbors.sort((a,b) => a.dist(game.player.tile) - b.dist(game.player.tile));
            let newTile = neighbors[0];
            this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
        }
    }

    getDisplayX(){
        return this.tile.x + this.offsetX;
    }

    getDisplayY(){
        return this.tile.y + this.offsetY;
    }

    draw(){
        if(this.teleportCounter >0){
            game.drawSprite(10, this.getDisplayX(), this.getDisplayY());
        }else{
            game.drawSprite(this.sprite, this.getDisplayX(), this.getDisplayY());
            this.drawHp();
        }

        // animates the moving animation
        this.offsetX -= Math.sign(this.offsetX) * (1 / 8); // Math.sign returns -1 if given a negative, 0 if 0, +1 if positive
        this.offsetY -= Math.sign(this.offsetY) * (1 / 8); // allows us to move in the correct direction until the offset is zero
    }

    // Hp pips are drawn left to write, offset by 5 pixels each and then stacked vertically offset by 5 pixels each row
    drawHp(){
        for(let i = 0; i < this.hp; i++){
            game.drawSprite(
                9,
                this.getDisplayX() + (i%3) * (5/16),
                this.getDisplayY() - Math.floor(i/3) * (5/16)
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

                    newTile.monster.stunned = true;
                    newTile.monster.hit(1); // TODO Monsters that are TPing should not be able to get hit?

                    game.shakeAmount = 3; // TODO screenshake only when the player gets hit ?

                    this.offsetX = (newTile.x - this.tile.x) / 2;
                    this.offsetY = (newTile.y - this.tile.y) / 2;
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
        this.sprite = 1; // sprite of dead player in the spritesheet
    }

    // when a monster moves we remove it from previous tile and add it to the new tile
    // we also trigger the stepOn method for the tile and pass it the monster in the argument
    move(tile){
        if(this.tile){
            this.tile.monster = null;

            this.offsetX = this.tile.x - tile.x;
            this.offsetY = this.tile.y - tile.y;
        }
        this.tile = tile;
        tile.monster = this;

        tile.stepOn(this);
    }
}

class Player extends Monster {
    constructor(tile){
        super(tile, 0, 3);
        this.isPlayer = true;
        this.teleportCounter = 0;
        // gets all spells names with Object.keys, shuffle them, grab x (game.numSpells) of them & assign them to this.spell (the player's spells)
        this.spells = util.shuffle(Object.keys(spells)).splice(0, game.numSpells); 
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

    // add a new single spell to our player
    addSpell(){
        let newSpell = util.shuffle(Object.keys(spells))[0]; // TODO Make it so you cant get the same spell twice        this.spells.push(newSpell);
    }

    castSpell(index){
        let spellName = this.spells[index];
        if(spellName){
            delete this.spells[index];
            spells[spellName]();
            game.tick();
        }
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
class Slimmy extends Monster{
    constructor(tile){
        super(tile, 6, 1);
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

    // TODO no working properly -- never eats walls ?
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
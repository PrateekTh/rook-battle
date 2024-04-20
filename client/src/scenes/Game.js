import { Scene } from 'phaser';
import io from 'socket.io-client'
import UIHandler from '../helpers/UIHandler';


export class Game extends Scene
{
    constructor ()
    {
        super('Game');
        this.isMyTurn = true;
        this.rook_X = 0;
        this.rook_Y = 7;
        this.size = 80;

    }

    preload(){
        this.load.image('bg', 'assets/bg.png');
        this.load.image('rook', 'assets/rook.png')

        const {width, height} = this.scale;
        this.s_width = width;
        this.s_height = height;
    }

    moveSelected(gameObject, x, y){
        gameObject.moveTo(x,y)
    }

    calculateCoordinates(row_id,col_id, size){
        let x = this.s_width * 0.5 + (col_id * (size + 5)) - size * 4;
        let y = this.s_height*0.5 + row_id * (size + 5) -size*4;
        return [x, y];
    }

    handleTileClick(tile){
        if (this.isMyTurn){
            //check if move is valid, with tile.cellstate
            this.isMyTurn = !this.isMyTurn;
            if(tile.cellstate === 1){
            //send to server
                console.log(tile.cellstate)
                this.socket.emit('ValidMove', tile.row, tile.col, this.socket.id)   
            }
        }else{
            console.log("Hey")
            this.UIHandler.showMessage(this, "Opponent's Turn", this.s_width/2, 100, 4000)
        }
    }


    updateAllTiles(scene){
      
        // Get all children, and filter for tiles (assuming tiles are instances of a specific class)
        const tiles = scene.children.getAll().filter(child => child instanceof Phaser.GameObjects.Rectangle); // Adjust tile class if needed
        
        let color = 0x27463B
        let time_diff = 0;
        let t_step = 100;
        console.log("Rook X: " + this.rook_X + ", Rook Y: " +this.rook_Y)
        //Update each tile's state
        tiles.forEach(tile => {
            tile.cellstate = 10/* Your logic to calculate the new state */;
            tile.setScale(0.6)
            if(tile.row === this.rook_X && tile.col < this.rook_Y){
                tile.cellstate = 1;
                setTimeout(()=>{
                    tile.fillColor = color;
                }, 1000 + time_diff)
                time_diff+= t_step;
                console.log("Horizontal: " + tile.name, tile.cellstate)
            }else if(tile.col === this.rook_Y && tile.row > this.rook_X){
                tile.cellstate = 1;
                setTimeout(()=>{
                    tile.fillColor = color;
                }, 1000 + time_diff)
                time_diff+= t_step;

                console.log("Vertical: " + tile.name, tile.cellstate)
            }else{
                tile.cellstate = 0;
                tile.fillColor = 0x000000;
            }
        });
    }

    createBoard(board){
        let x = this.s_width*0.5-this.size*4;
        let y = this.s_height*0.5-this.size*4;
        board.forEach((row, row_id) => {
            row.forEach((cellstate, col_id) =>{
                let tile = this.add.rectangle(x,y,this.size,this.size,0x000000)
                tile.name = 'box_'+ row_id + "_" + col_id ;
                tile.row = row_id;
                tile.col = col_id;
                tile.cellstate = 0;

                tile.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, ()=> {
                    console.log(`Clicked ${tile.name} at (${tile.x}, ${tile.y}), Cell State: ${tile.cellstate}`);
                    console.log(`Calculated Coordinates: ${this.calculateCoordinates(tile.row, tile.col, this.size)}`)
                    this.handleTileClick(tile);
                });

                x += this.size + 4;
                if ((col_id+1)%8 === 0){
                    y+= this.size+4;
                    x = this.s_width*0.5-this.size*4;
                }
            })
        })

        this.updateAllTiles(this);
    }

    tweenSpriteTo(sprite, targetX, targetY, duration = 500, ease = 'Linear') {
        // Create a tween targeting the sprite's x and y properties
        const tween = this.tweens.add({
            targets: sprite,
            x: targetX,
            y: targetY,
            ease: ease,
            duration: duration
        });
    }

    create(){
        console.log("We begin");
        this.UIHandler = new UIHandler(this);
        this.UIHandler.buildUI();

        this.board = [
            [0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0,],
        ]

        this.createBoard(this.board, 7, 0);
        
        let bg = this.add.sprite(this.s_width/2-25, this.s_height/2-25, 'bg')
        let rook = this.add.sprite(782,192,'rook')

        bg.setScale(2).setOrigin(0.5,0.5)
        rook.setScale(0.5).setDepth(10)

        

        this.socket = io('http://localhost:3000');
        
        this.socket.on('rookPosition', (x,y)=>{

            this.rook_X = x;
            this.rook_Y = y;
            let coords = this.calculateCoordinates(this.rook_X, this.rook_Y, 80)
            this.tweenSpriteTo(rook, coords[0], coords[1], 500)
            console.log(`coords from final socket: ${coords}, Rook position: ${this.rook_X}, ${this.rook_Y}`)
            this.updateAllTiles(this);
            
        })

        this.socket.on('connect', ()=>{
           console.log('Connected to Server!')
        })

        this.socket.on('win', ()=>{
            this.UIHandler.finalText(this, "You Win!", this.s_width/2, this.s_height - this.s_height/10, 10000)
        })

        this.socket.on('gameover', ()=>{
            this.UIHandler.finalText(this, "Game Over", this.s_width/2, 200)
        })

        this.socket.on('turn', ()=>{
            this.isMyTurn = true;
            this.UIHandler.showMessage(this, "Your Turn", this.s_width/2, 100, 4000)
            //create timer

        })
    }

    update(){

    }

}


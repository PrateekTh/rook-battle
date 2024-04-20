import { Scene } from 'phaser';
import io from 'socket.io-client'
import UIHandler from '../helpers/UIHandler';


export class Game extends Scene
{
    constructor ()
    {
        super('Game');
        this.isMyTurn = true;
        this.rook_X = 7;
        this.rook_Y = 0;
    }

    preload(){
        this.load.image('bg', 'assets/bg.png');
        this.load.image('rook', 'assets/rook.png')
    }

    moveSelected(gameObject, x, y){
        gameObject.moveTo(x,y)
    }

    calculateCoordinates(row_id,col_id, size){
        const {width, height} = this.scale;
        let x = width * 0.5 + (col_id * (size + 5)) - size * 4;
        let y = height*0.5 + row_id * (size + 5) -size*4;
        return [x, y];
    }

    handleTileClick(tile){
        if (this.isMyTurn){
            //check if move is valid, with tile.cellstate
            console.log(this.isMyTurn)
            if(tile.cellstate === 1){
            //send to server
                console.log(tile.cellstate)
                this.socket.emit('ValidMove', tile.x, tile.y, tile.row, tile.col, this.socket.id)   
            }
        }
    }


    updateAllTiles(scene) {
      
        // 2. Get all children, and filter for tiles (assuming tiles are instances of a specific class)
        const tiles = scene.children.getAll().filter(child => child instanceof Phaser.GameObjects.Rectangle); // Adjust tile class if needed
        
        console.log("Rook X: " + this.rook_X + ", Rook Y: " +this.rook_Y)
        // 3. Update each tile's state
        tiles.forEach(tile => {
            tile.cellstate = 10/* Your logic to calculate the new state */;
            tile.fillColor = 0x2f2f2f;
            
            // Need to check rook X and Y config again:
            if(tile.row === this.rook_X && tile.col < this.rook_Y){
                tile.cellstate = 1;
                tile.fillColor = 0xffffff;
                console.log("Horizontal: " + tile.name, tile.cellstate)
            }else if(tile.col === this.rook_Y && tile.row > this.rook_X){
                tile.cellstate = 1;
                tile.fillColor = 0xffffff;
                console.log("Vertical: " + tile.name, tile.cellstate)
            }else{
                tile.cellstate = 0;
                tile.fillColor = 0x2f2f2f;
            }
        });
    }



    createBoard(board){
        
        const {width, height} = this.scale;
        let size = 80;
        let x = width*0.5-size*4;
        let y = height*0.5-size*4;
        board.forEach((row, row_id) => {
            row.forEach((cellstate, col_id) =>{
                let tile = this.add.rectangle(x,y,size,size,0x4f4f4f)
                tile.name = 'box_'+ row_id + "_" + col_id ;
                tile.row = row_id;
                tile.col = col_id;

                if(row_id === this.rook_Y && col_id < this.rook_X){
                    cellstate = 1;
                }else if(col_id === this.rook_X && row_id > this.rook_Y){
                    cellstate = 1;
                }

                tile.cellstate = cellstate;

                tile.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, ()=> {
                    console.log(`Clicked ${tile.name} at (${tile.x}, ${tile.y}), Cell State: ${tile.cellstate}`);
                    console.log(`Calculated Coordinates: ${this.calculateCoordinates(tile.row, tile.col, size)}`)
                    this.handleTileClick(tile);
                });

                x += size + 5;
                if ((col_id+1)%8 === 0){
                    y+= size+5;
                    x = width*0.5-size*4;
                }

            })
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

        let board = this.createBoard(this.board, 7, 0);

        let bg = this.add.sprite(512,512, 'bg')
        let rook = this.add.sprite(782,192,'rook')

        bg.setScale(2)
        rook.setScale(0.5).setDepth(10)

        this.socket = io('http://localhost:3000');

        this.socket.on('rookPosition', (x,y)=>{

            this.rook_X = x;
            this.rook_Y = y;
            let coords = this.calculateCoordinates(this.rook_X, this.rook_Y, 80)
            rook.setPosition(coords[0],coords[1]);
            console.log(`coords from final socket: ${coords}, Rook position: ${this.rook_X}, ${this.rook_Y}`)

            this.updateAllTiles(this)
        })

        this.socket.on('connect', ()=>{
           console.log('Connected to Server!')
        })


        //Add the last corner and win condition
    }

    update(){

    }

}


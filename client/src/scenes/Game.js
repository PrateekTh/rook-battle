import { Scene } from 'phaser';
import io from 'socket.io-client'
import UIHandler from '../helpers/UIHandler';


export class Game extends Scene
{
    constructor ()
    {
        super('Game');
        this.isMyTurn = true;
        this.playerX;
        this.playerY;

    }

    preload(){
        this.load.image('bg', 'assets/bg.png');
        this.load.image('rook', 'assets/rook.png')
    }

    moveSelected(gameObject, x, y){
        gameObject.moveTo(x,y)
    }

    calculateCoordinates(x,y){

        return x,y;
    }

    handleTileClick(tile){
        if (this.isMyTurn){
            //check if move is valid, with tile.cellstate
            console.log(this.isMyTurn)
            if(tile.cellstate === 1){
            //send to server
                console.log(tile.cellstate)
                this.socket.emit('ValidMove', tile.x, tile.y, tile.name, this.socket.id)   
            }
        }
    }

    createBoard(board, rook_x, rook_y){
        
        const {width, height} = this.scale;
        let size = 80;
        let x = width*0.5-size*4;
        let y = height*0.5-size*4;
        board.forEach((row, row_id) => {

            row.forEach((cellstate, col_id) =>{
                let tile = this.add.rectangle(x,y,size,size,0x4f4f4f)

                tile.name = 'box_'+ row_id + "_" + col_id ;
                
                if(row_id === rook_y && col_id < rook_x){
                    cellstate = 1;
                }else if(col_id === rook_x && row_id > rook_y){
                    cellstate = 1;
                }

                tile.cellstate = cellstate;

                tile.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, ()=> {
                    console.log(`Clicked ${tile.name} at (${tile.x}, ${tile.y}), Cell State: ${cellstate}`);
                    this.handleTileClick(tile);
                });
                x += size + 5;
                if ((col_id+1)%8 === 0){
                    y+= size+5;
                    x = width*0.5-size*4;
                }
            })
            console.log(board)
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
        let rook = this.add.sprite(512,512,'rook')

        bg.setScale(2)
        rook.setScale(0.5)

        this.socket = io('http://localhost:3000');

        this.socket.on('rookPosition', (x,y)=>{
            rook.setPosition(x,y);
            //add the rook_X and rook_Y and recreate the interactive game board
        })

        this.socket.on('connect', ()=>{
           console.log('Connected to Server!')
        })



        //Add the last corner and win condition

    }

    update(){

    }

}


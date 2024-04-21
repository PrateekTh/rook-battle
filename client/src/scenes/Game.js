import { Scene } from 'phaser';
import io from 'socket.io-client' //Import Socket.io for Client side
import UIHandler from '../helpers/UIHandler';//Import UI Handler for text

//Create the main Game Scene
export class Game extends Scene
{
    constructor ()
    {   
        //Setup main required variables
        super('Game');
        this.isMyTurn = true; // Variable to determine if it's this client's turn
        this.rook_X = 0; //Rook's starting X
        this.rook_Y = 7; //Rook's starting Y
        this.size = 80; //Size of tiles (Hidden Interactive board)

    }

    preload(){

        //Preload all required assets
        this.load.image('bg', 'assets/bg.png');
        this.load.image('rook', 'assets/rook.png')
        this.load.image('player', 'assets/player.png')
        this.load.image('target', 'assets/target.png')
        
        //Setup Graphical variables (for ease of use)
        const {width, height} = this.scale; //Takes the height and width of the screen. Enables an additional measure for a responsive website.
        this.s_width = width;
        this.s_height = height;
        this.timerColor = 0x82E0AA; //Control for the color of the timer
        this.tile_color = 0x27463B; // Control for the color of interactive tiles
    }

    //Custom function to calculate the coordinates ofa given board cell
    calculateCoordinates(row_id, col_id, size){
        let x = this.s_width * 0.5 + (col_id * (size + 5)) - size * 4;
        let y = this.s_height*0.5 + row_id * (size + 5) -size*4;
        return [x, y];
    }

    //Function to handle click on interactive tiles
    handleTileClick(tile){
        //Check of the player clicking has a turn (1st Measure against)
        if (this.isMyTurn){
            //check if move is valid, with tile.cellstate
            this.isMyTurn = !this.isMyTurn;
            if(tile.cellstate === 1){
                //send to server
                this.socket.emit('ValidMove', tile.row, tile.col, this.socket.id)   
            }
        }else{
            this.UIHandler.showMessage(this, "Opponent's Turn", this.s_width/2, 100, 4000)
        }
    }

    //Function to update the valid tiles, and the associated interface
    updateAllTiles(scene){
        // Get all children of the scene, and filter for tiles (assuming tiles are instances of a specific class)
        const tiles = scene.children.getAll().filter(child => child instanceof Phaser.GameObjects.Rectangle); // Adjust tile class if needed
        
        //Set up variables for a small timeOut based animation
        let time_diff = 0;
        let t_step = 100;

        //Update each tile's state
        tiles.forEach(tile => {
            tile.setScale(0.7); //Set size of each new tile
            if(tile.row === this.rook_X && tile.col < this.rook_Y){
                tile.cellstate = 1; //Set tile cellstate to interactive
                //Add a time out to update the color of interactive tiles
                setTimeout(()=>{
                    tile.fillColor = this.tile_color;
                }, 500 + time_diff)
                time_diff+= t_step; //Increment the animation timeline
            }else if(tile.col === this.rook_Y && tile.row > this.rook_X){
                tile.cellstate = 1;
                //Add a time out to update the color of interactive tiles
                setTimeout(()=>{
                    tile.fillColor = this.tile_color;
                }, 500 + time_diff)
                time_diff+= t_step; //Increment the animation timeline
            }else{
                //Update tiles that are to be set as non-interactive
                tile.cellstate = 0;
                tile.fillColor = 0x000000;
            }
        });
    }

    //Function to create the board & tiles for the first time
    createBoard(board){
        //Setup starting X and Y
        let x = this.s_width*0.5-this.size*4;
        let y = this.s_height*0.5-this.size*4;

        //Populate the screen with a new rectangle for each position in the provided 2D matrix (Board)
        board.forEach((row, row_id) => {
            row.forEach((cellstate, col_id) =>{
                let tile = this.add.rectangle(x,y,this.size,this.size,0x000000)
                tile.name = 'box_'+ row_id + "_" + col_id ; //Create a unique name for each tile (if required)
                tile.row = row_id; //Assign Row ID
                tile.col = col_id; //Assign Column ID
                tile.cellstate = 0; //Set initial cellstate to 0. This is used to determine a valid move location.
                //Add click/tap functionality to tiles
                tile.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, ()=> {
                    // console.log(`Clicked ${tile.name} at (${tile.x}, ${tile.y}), Cell State: ${tile.cellstate}`);
                    this.handleTileClick(tile);
                });

                //Shift X & Y position with respect to the next tile placement requirement
                x += this.size + 4; //Increment X coordinate
                if ((col_id+1)%8 === 0){ //Switching to the next row after every 8 tiles
                    y+= this.size+4; //Increment Y coordinate
                    x = this.s_width*0.5-this.size*4; //Reset X coordinate to the left-most tile
                }
            })
        })
        this.updateAllTiles(this);//Set the Clickable tiles after the board is created
    }

    //Function to animate a sprite to a target location (Made for Convenience)
    tweenSpriteTo(sprite, targetX, targetY, duration = 500, ease = 'cubic') {
        // Create a tween targeting the sprite's x and y properties
        const tween = this.tweens.add({
            targets: sprite,
            x: targetX,
            y: targetY,
            ease: ease,
            duration: duration
        });
    }

    //Main Create loop, Handles Placement of objects and Sockets
    create(){
        //console.log("We begin");
        this.UIHandler = new UIHandler(this); //Create a new instance of the UI Handler

        //Set up the game board (Can be easily customised, if new game modes are needed)
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

        //Create the board for the first time
        this.createBoard(this.board);

        this.UIHandler.showMessage(this, "Welcome!", this.s_width/2, 100, 3000); //Display a welcome message on startup
        this.UIHandler.finalText(this, "ROOK'S     MOVE", this.s_width/2-30, 900, 10000); // Add the game name as a heading

        //Place Various Sprites
        let bg = this.add.sprite(this.s_width/2-25, this.s_height/2-25, 'bg'); //Add Chessboard Background
        let rook = this.add.sprite(782,192,'rook'); //Add Rook Sprite to starting position (Location can be calculated from coordinates function as well)
        this.player = this.add.sprite(this.s_width/2 , 900,'player'); //Add Player Icon
        this.target = this.add.sprite(192 , 780,'target'); //Add Endpoint
        this.timerBar = this.add.rectangle(0, 995 ,0,30, this.timerColor); //Add timer UI

        //Make adjustments to sprites as required
        this.target.setDepth(3)
        bg.setScale(2).setOrigin(0.5,0.5)
        rook.setScale(0.5).setDepth(5)
        this.timerBar.setOrigin(0,0)
        this.barStep = this.s_width/(30*60*2); //Set bar increment variable for update animation

        // -------------------- CLIENT SIDE SOCKET HANDLING -------------------- //

        //Create the socket
        this.socket = io('http://localhost:3000');

        //Add Connect event listener, to ascertain connection.
        this.socket.on('connect', ()=>{
            console.log('Connected to Server!')
        }) 

        //Handle 'setRookPosition' event, and update Tiles & Rook Position
        this.socket.on('setRookPosition', (x,y)=>{
            this.rook_X = x;
            this.rook_Y = y;
            let coords = this.calculateCoordinates(this.rook_X, this.rook_Y, 80)
            this.tweenSpriteTo(rook, coords[0], coords[1], 750)
            console.log(`coords from final socket: ${coords}, Rook position: ${this.rook_X}, ${this.rook_Y}`)
            this.updateAllTiles(this);
        })
        
        //Display text to winner, on recieving "win" event
        this.socket.on('win', ()=>{
            this.UIHandler.finalText(this, "You Win!", this.s_width/2, this.s_height - 50, 10000)
        })

        //Handle 'gameover' event, display text to all clients, and restart the game
        this.socket.on('gameover', ()=>{
            this.UIHandler.finalText(this, "GAME OVER!", this.s_width/2, 100)
            this.UIHandler.showMessage(this, "The game will restart.", this.s_width/2, 300, 4000)
            setTimeout(reload, 8000)
        })

        //Handle 'turn' message from server, and show text to user
        this.socket.on('turn', ()=>{
            this.isMyTurn = true;
            this.UIHandler.showMessage(this, "Your Turn", this.s_width/2, 100, 4000)
            this.timerBar = this.add.rectangle(0,1000,0,20,this.timerColor);
        })

        //Reload function (for when needed)
        function reload(){
            window.location.reload();
        }

        //Handle 'timeout' message on user's end.
        this.socket.on('timeout', ()=> {
            this.UIHandler.finalText(this, "Turn Player unresponsive.\n Reloading in 5 Seconds", this.s_width/2, 100, 4000)
            setTimeout(reload, 5000)
        })

        //Handle 'roomFull' event, and tell user about spectator status.
        this.socket.on('roomFull', ()=>{
            console.log('spectator')
            this.UIHandler.showMessage(this, "The room is full.\n You are a spectator!", this.s_width/2, 100, 10000)
        })

        // ---------------- END OF CLIENT SIDE SOCKET HANDLING ---------------- //
    }

    //Main update function, runs at 60fps
    update(){
        //Update Player Avatar and Rotation
        this.player.rotation+=0.002;

        //Update TimerBar Width
        this.timerBar.width += this.barStep;
    }
}


const express = require('express');
const app = express();
const cors = require('cors')
const http = require('http').Server(app);
const io = require('socket.io')(http, {cors: {origin: "*"}});

let turn = 0; // To manage turns
let roomsize = 2; //To select a custom room size

let connectedSockets = []; // Object to store connected sockets

//Setup for Server-Side Timer
const TIMEOUT_DURATION = 30000; // 30 seconds in milliseconds
let timerId = null; //Empty variable for timer function

io.on('connection', (socket) => {

    if ((connectedSockets.length) === roomsize){
        io.to(socket.id).emit('roomFull')
        console.log("Emitting full room")
    } else {
        connectedSockets.push(socket.id);
        console.log(`Socket with ID ${socket.id} connected.  Total Players = ${connectedSockets.length}`);
    }
    

    socket.on('noResponse', (socket_id)=>{

        console.log(socket_id + " has no response")
        io.emit('remove', socket_id)
    })

    //On recieving a valid move from a client
    socket.on('ValidMove', (row, col, socket_id)=>{
        console.log('Received valid move from a client. Resetting timer.');
        clearTimeout(timerId); //Resetting the timer on getting a valid move.
        
        //Check for turn (Second check for correct player)
        if(connectedSockets[turn]=== socket_id){ 
            io.emit('setRookPosition', row,col);
            //Check for win condition
            if(row === 7 && col === 0){
                console.log(socket_id + " Wins!") //Log to server control
                io.emit('gameover') //Send End game message for all client
                io.to(socket_id).emit('win') //Tell client with current Socket ID of Victory
            }
            //Increment turn
            turn++;
        }
        //Reset turn to first player if all players have made a move
        if(turn === (roomsize)){ turn = 0}
        //Send message "turn" to socket with next turn (After current move)
        io.to(connectedSockets[turn]).emit('turn')
        
        //Setup the 30 Second Timer
        timerId = setTimeout(() => {
            //Logging timeOut details to the Server
            console.log('Clients timed out after', TIMEOUT_DURATION / 1000, 'seconds.');
            io.emit('timeout'); // Emit "timeout" event to all connected clients
            clearTimeout(timerId);//Resetting the timer
            timerId = null;
        }, TIMEOUT_DURATION);
    })

    // Handle disconnection
    socket.on('disconnect', () => {   
        //Remove disconnected client from list of sockets
        const disconnectedSocketId = Object.values(connectedSockets).find(id => id === socket.id);
        connectedSockets.splice(disconnectedSocketId, 1) 
        turn = 0; //Reset Turn
        io.to(connectedSockets[turn]).emit('turn'); //Tell player with new turn to move
        console.log('A user disconnected');
    });
});

//Start Server on port 3000
http.listen(3000, () => {
    console.log('Server listening on port 3000');
});
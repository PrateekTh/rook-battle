const express = require('express');
const app = express();
const cors = require('cors')
const http = require('http').Server(app);
const io = require('socket.io')(http, {cors: {origin: "*"}});

let turn = 0;
let roomsize = 2;

let connectedSockets = []; // Object to store connected sockets


io.on('connection', (socket) => {
    connectedSockets.push(socket.id);
    console.log(`Socket with ID ${socket.id} connected.  Total Players = ${connectedSockets.length}`);
    
    socket.on('ValidMove', ( row, col, socket_id)=>{
        console.log("someone clicked")
        //check for turn
        if(connectedSockets[turn]=== socket_id){
            
            console.log('ValidMove, ' + socket_id + " Bro");
            io.emit('rookPosition', row,col);

            //check for win condition
            if(row === 7 && col === 0){
                console.log(socket_id + " Wins!")
                io.emit('gameover');
                io.to(socket_id).emit('win')
            }
            turn++;
        }
        console.log(turn, connectedSockets.length);
        if(turn === (roomsize)){ turn = 0}

        io.to(connectedSockets[turn]).emit('turn')
        
    })

    // Handle disconnection
    socket.on('disconnect', () => {   
        const disconnectedSocketId = Object.values(connectedSockets).find(id => id === socket.id);

        turn = 0;
        connectedSockets.splice(disconnectedSocketId, 1)
        console.log('A user disconnected');
    });
});

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});

const express = require('express');
const app = express();
const cors = require('cors')
const http = require('http').Server(app);
const io = require('socket.io')(http, {cors: {origin: "*"}});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('ValidMove', (x, y, row, col, socket_id)=>{


        //check for win condition
        console.log('ValidMove Bro ' + row + "," + col )
        io.emit('rookPosition', row,col)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

http.listen(3000, () => {
  console.log('Server listening on port 3000');
});
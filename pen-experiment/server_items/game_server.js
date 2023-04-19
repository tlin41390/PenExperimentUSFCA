const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');

const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socket(server);

// const publicPath = path.join(__dirname, '/../public');

// app.use(express.static(publicPath));

// app.get('/:room', (req, res) => {
//     res.sendFile(path.join(__dirname + '/../public/index.html'));
// });

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});

let rooms = {};
io.on('connection', (socket) => {
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = 0;
        }

        //Increment number of clients in room
        rooms[roomId]++;

        //check if there are 2 clients in room
        if (rooms[roomId] === 2) {
            io.to(roomId).emit('startGame');
        }
    })

    socket.on('disconnecting', () => {
        let roomId = [...socket.rooms][1];
        console.log(roomId);

        if (rooms[roomId]) {
            rooms[roomId]--;
        }

        io.socket.in(roomId).emit('revokeStart');
        socket.leave(roomId);
    });

    socket.on('startGame', (roomId) => {
        io.sockets.in(roomId).emit('startGame');
        socket.broadcast.to(roomId).emit('startGame');
    })

    socket.on('startTimer', (roomId, timer) => {
        io.sockets.in(roomId).emit('startTimer', timer);
    })

    socket.on('takeControl', (roomId) => {
        socket.broadcast.to(roomId).emit('disableControl');
    })

    socket.on('giveControl', (roomId) => {
        socket.broadcast.to(roomId).emit('takeControl');
    })

    socket.on('requestControl', (roomId) => {
        socket.broadcast.to(roomId).emit('displayRequestControl');
    })

    socket.on('updateOpponent', (roomId, opponentScore) => {
        socket.broadcast.to(roomId).emit('updateOpponentScore', opponentScore);
    })
});
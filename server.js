
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const players = {};

app.use(express.static('client'));

io.on('connection', socket => {
  console.log('Player connected:', socket.id);

  socket.on('characterSelected', color => {
    players[socket.id] = { id: socket.id, x: Math.random() * 600, y: Math.random() * 400, color };
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);
  });

  socket.on('playerMovement', movementData => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      socket.broadcast.emit('playerMoved', { id: socket.id, ...movementData });
    }
  });

  socket.on('fireBullet', data => {
    socket.broadcast.emit('bulletFired', data);
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

http.listen(3000, () => console.log('Server on http://localhost:3000'));

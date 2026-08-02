const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    console.log("Un joueur s'est connecté :", socket.id);

    // Création du joueur avec une position de départ
    players[socket.id] = {
        x: Math.floor(Math.random() * 400) + 50,
        y: Math.floor(Math.random() * 400) + 50,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };

    // Envoyer la liste de tous les joueurs au nouveau
    socket.emit('currentPlayers', players);
    // Prévenir les autres qu'un nouveau est arrivé
    socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

    // Déplacement
    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            io.emit('playerMoved', { id: socket.id, player: players[socket.id] });
        }
    });

    // Déconnexion
    socket.on('disconnect', () => {
        console.log("Joueur déconnecté :", socket.id);
        delete players[socket.id];
        io.emit('disconnectPlayer', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});

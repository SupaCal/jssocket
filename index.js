var app = require('express')();
var http = require('http').createServer(app);
var path = require('path');
var options = {}
var io = require('socket.io')(http, options);
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/index.html'))
});
app.get('/socket', (req, res) => {
    res.sendFile(__dirname+ '/node_modules/socket.io-client/dist/socket.io.js')
});

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

var players = [];
var availableSpawnLocations = [
    { x: 10, y: 10 },
    { x: 10, y: 50 },
    { x: 10, y: 90 },
    { x: 10, y: 130 },
    { x: 10, y: 170 },
    { x: 10, y: 210 }];
function getSpawnCoords(){
    if (availableSpawnLocations.length != 0){

        return getRndInteger(0, availableSpawnLocations.length - 1)
    }
}
io.on('connection', (socket) => {
    console.log('a user connected');
    var thisplayersspawncoordsindex = getSpawnCoords()
    io.emit('playerjoin', {"id": socket.id, "coords": availableSpawnLocations[thisplayersspawncoordsindex]})
    socket.send({type: "listofplayers", data: players})
    socket.send({type: "yourcoords", data: availableSpawnLocations[thisplayersspawncoordsindex]})
    players.push({"id": socket.id, "coords": availableSpawnLocations[thisplayersspawncoordsindex]})
    availableSpawnLocations.splice(thisplayersspawncoordsindex, 1)
    socket.on('usermove', (coords) => {
       
        var playersindex = players.findIndex(element => element.id == socket.id)
        players[playersindex].coords = coords;
        console.log("players[playersindex].coords", players[playersindex].coords)
        
    })
    socket.on('disconnect', () => {
        var playersindex = players.findIndex(element => element.id == socket.id)
        availableSpawnLocations.push(players[playersindex].coords)
        players.splice(playersindex, 1); 
        io.emit('playerleave', socket.id)
        io.emit('playerchange', players)
      });
  });
function locPulse(){
    io.emit('otherplayermoved', players)
}
setInterval(locPulse, 100);









http.listen(3010, () => {
    console.log('listening on *:3010');
  });
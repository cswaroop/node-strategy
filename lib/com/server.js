var nvp = require('../nvp.js');

function Server() {
  var io = null;
  var users = { };
  var self = this;

  this.init = function(app) {
    io = require('socket.io').listen(app);

    io.configure(function() {
      io.set('transports', ['websockets', 'xhr-polling']);
      io.set('log level', 0);
    });

    io.sockets.on('connection', function(socket) {
      console.log('connecting', socket.id);
      users[socket.id] = 
        nvp.User.new(socket.id, socket.id, socket);

      //console.log('user', users[socket.id]);

      socket.on('game', function(request) {
        if(users[socket.id].game) {
          users[socket.id].game.processMethod(request.command, users[socket.id], request.args);
        }
      });

      socket.on('gameLister', function(request) {
        self.gameLister.processMethod(request.command, users[socket.id], request.args);
      });
    });
  };

  this.listenFor = function(name, callback) {
    io.sockets.on(name, callback);
  }

  this.broadcast = function(name, data) {
    io.sockets.emit(name, data);
  }

  this.broadcastGame = function(game, name, data) {
    //console.log(game);
    for(var u in game.users) {
      data.forUser = game.users[u].id;
      game.users[u].socket.emit(name, data);
    }
  }
}

exports.new = function() {
  return new Server();
}

  

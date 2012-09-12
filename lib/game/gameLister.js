var nvp = require('../nvp.js');

function GameLister() {
  this.init = function(server) {

    this.server = server;
    this.server.gameLister = this;
  
    this.games = { };

    /*
    this.createGame({ gameId : 12312 });
    this.createGame({ gameId : 875554 });
    this.createGame({ gameId : 345 });
    */

    setInterval(proxy(this, this.broadcastGames), 1000);
  }

  this.broadcastGames = function() {

    var gamesToBroadcast = [];
    for (var key in this.games) {
      gamesToBroadcast.push({
        gameId : this.games[key].gameId, 
        gameStarted : this.games[key].gameStarted,
        isPrivate: this.games[key].isPrivate
      });
    }

    //console.log('omg broadcasting!!!!!!!!!!!!!!!!!!!!!!!!!!!', gamesToBroadcast);

    this.server.broadcast('rooms', { games : gamesToBroadcast });
  }

  this.createGame = function(args) {
    var game = nvp.Game.new(args.gameId, args.isPrivate);

    console.log('args', args);

    game.init(this.server);

    this.games[args.gameId] = game;

    console.log('game create', args.gameId);
  }

  this.joinGame = function(user, args) {
    if(this.games[args.gameId] == null) {
      this.createGame(args);
    }

    this.games[args.gameId].join(user);
  }

  this.processMethod = function(name, user, args) {
    this[name](user, args);
  }

  function proxy(ctx, fn) {
    return function() {
      fn.call(ctx);
    }
  }
}

exports.new = function() {
  return new GameLister();
}

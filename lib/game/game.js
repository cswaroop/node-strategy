var Country = require('./country.js');
var User = require('./user.js');

function Game(gameId, isPrivate) {

  this.gameId = gameId;
  this.countries = { };
  this.users  = { };
  this.server = null;
  this.countdown = null;
  this.gameStarted = false;
  this.moveQueue = [];
  this.isPrivate = isPrivate;
  this.turnResults = { };
  this.isOver = false;
  this.winnerUserId = 0;

  this.join = function(user) {
    if(this.gameStarted) return;

    this.users[user.id] = user;
    user.name = '(unnamed)';
    user.game = this;
  }

  this.broadcastGame = function() {
    this.server.broadcastGame(this, 'gameState', { 
      countries: this.countries, 
      countdown: this.countdown,
      gameStarted: this.gameStarted,
      users: this.slimUsers(),
      turnResults: this.turnResults,
      isOver: this.isOver,
      winnerUserId: this.winnerUserId
    });

    if (this.isOver) {
      clearInterval(this.intervalId);
      console.log('game over, yo. Clearing interval');
    }

    for (var userId in this.users) {
      var user = this.users[userId];
      if (user.isALoser) {
        delete this.users[userId];
        console.log('removing user', userId);
      }
    }
  }

  this.slimUsers = function() {
    var users = { };
    for(var u in this.users) {
      users[u] = { 
        id: this.users[u].id, 
        name: this.users[u].name,
        totalTroops: this.troopCountFor(u),
        troopCap: this.troopCapFor(u),
        number: this.users[u].number,
        isWinner: this.users[u].isWinner,
        isALoser: this.users[u].isALoser
      };
    }

    return users;
  }

  this.resetCountdown = function() {
    this.countdown = 15;
  }

  this.isValidMove = function(user, from, to, count) {
    var fromCountry = this.countries[from];
    if(fromCountry.owner != user) return false;
    
    if(fromCountry.troopCount <= 1) return false;

    return true;
  }

  this.processMoves = function() {
    for(var m in this.moveQueue) {
      var move = this.moveQueue[m];

      if(this.isValidMove(move.user, move.from, move.to, move.count) == false) continue;

      var fromCountry = this.countries[move.from];
      var count = move.count;

      var oneLess = fromCountry.troopCount - 1;

      if(move.count == 'all') {
        count = oneLess;
      }

      if(move.count > oneLess) {
        count = oneLess;
      }

      this.removeUnits(this.users[move.user], move.from, count);

      this.addUnits(this.users[move.user], move.to, count);

      //this.turnResults[move.user].push(count + " ninja(s) were moved from " + move.from + " to " + move.to + ".");
    }

    this.clearMoveQueue();
  }

  this.clearMoveQueue = function() {
    this.moveQueue.length = 0;
  }

  this.battle = function() {
     for(var c in this.countries) {
      var country = this.countries[c];
      country.battle(this.turnResults);
    }
  }

  this.conquer = function() {
    for(var c in this.countries) {
      var country = this.countries[c];
      country.setConqueror(this.turnResults);
    }
  }

  this.tickWorld = function() {
    this.resetTurnResults();
    this.processMoves();
    this.battle();
    this.conquer();
    this.regen();
    this.clearRecentlyConquered();
    this.resetCountdown();
    this.tellFailures();
    this.tellWinner();
  }

  this.tellFailures = function() {
    for(var userId in this.users) {
      if (this.users[userId].isALoser)
        continue;

      var countryCount = 0;
      for(var countryId in this.countries) {
        if (this.countries[countryId].owner == userId) {
          countryCount++;
        }
      }
      
      if (countryCount === 0) {
        this.users[userId].isALoser = true;  
        console.log('User ' + userId + ' is a loser.');
      }

    }
  }

  this.tellWinner = function() {
    var aliveCount = 0;
    for(var userId in this.users) {
      var user = this.users[userId];
      
      if (!user.isALoser)
        aliveCount++;
    }
    
    if (aliveCount == 1) {
      for(var userId in this.users) {
        var user = this.users[userId];
        if (!user.isALoser) {
          user.isWinner = true;
          this.isOver = true;
          this.winnerUserId = userId;
          console.log('we have a winner!', userId);
        }
      }
    }
  }

  this.resetTurnResults = function() {
    this.turnResults = { };
    for(var userId in this.users) {
      this.turnResults[userId] = [];
    }
    this.turnResults['npc'] = [];
  }

  this.clearRecentlyConquered = function() {
    for(var c in this.countries) {
      var country = this.countries[c];
      country.recentlyConquered = false;
    }
  }

  this.regen = function () {

    for(var c in this.countries) {
      var caps = { };

      for(var userId in this.users) {
        caps[userId] = { cap: this.troopCapFor(userId), troops: this.troopCountFor(userId) };
        caps[userId].left = caps[userId].cap - caps[userId].troops;
      }

      var country = this.countries[c];
      var results = country.buildTroops(caps);

      /*
      if(results) {
        this.turnResults[country.owner].push(results);
      }
      */
    }
  }

  this.troopCapFor = function(user) {
    var capPerCountry = 20;
    return this.countryCountFor(user) * capPerCountry;
  }

  this.troopCountFor = function(user) {
    var count = 0;
    for(var c in this.countries) {
      var country = this.countries[c];
      if(country.owner == user) {
        count = count + country.troopCount;
      }

      if(country.others[user]) {
        count = count + country.others[user];
      }
    }
    
    return count;
  }

  this.countryCountFor = function(user) {
    var count = 0;
    for(var c in this.countries) {
      var country = this.countries[c];
      if(country.owner == user) {
        count = count + 1;
      }
    }

    return count;
  }

  this.decrementCountDown = function() {
    this.countdown -= 1;
    if(this.countdown == 0) {
      this.tickWorld();
    }
  }

  this.startGame = function() {
    if(this.gameStarted) return;

    var i = 1;

    for(var u in this.users) {
      if(i == 1)
      {
        this.countries['a'].owner = u;
        this.addUnits(this.users[u], 'a', 5);
        this.users[u].number = 1;
      }
      if(i == 2)
      {
        this.countries['r'].owner = u;
        this.addUnits(this.users[u], 'r', 5);
        this.users[u].number = 2;
      }
      if(i == 3)
      {
        this.countries['h'].owner = u;
        this.addUnits(this.users[u], 'h', 5);
        this.users[u].number = 3;
      }
      if(i == 4)
      {
        this.countries['m'].owner = u;
        this.addUnits(this.users[u], 'm', 5);
        this.users[u].number = 4;
      }
      i++
    }

    this.countdown = 15;
    this.gameStarted = true;
    setInterval(proxy(this, this.decrementCountDown), 1000);
  }

  /*
  this.forcePlayer1ToBeAwesome = function() {
        this.foo(u, 'a');
        this.foo(u, 'b');        
        this.foo(u, 'c');        
        this.foo(u, 'd');       
        this.foo(u, 'e');
        this.foo(u, 'f');
        this.foo(u, 'g');
        this.foo(u, 'i');
        this.foo(u, 'j');
        this.foo(u, 'k');
        this.foo(u, 'l');
        this.foo(u, 's');
        this.foo(u, 'n');
        this.foo(u, 'o');
        this.foo(u, 'p');
        this.foo(u, 't');
        this.foo(u, 'q');
        this.foo(u, 'h');
  }

  this.foo = function(user, country) {
     this.countries[country].owner = user;
     this.addUnits(this.users[user], country, 3);
     this.users[user].number = 1;
   }
  */

  this.addUnits = function(user, countryName, amount) {
    var country = this.countries[countryName];

    if(country.owner == user.id) {
      country.troopCount = country.troopCount + amount;
    }
    else {
      if(!country.others[user.id]) {
        country.others[user.id] = 0;
      }

      country.others[user.id] = country.others[user.id] + amount;
    }
  }

  this.removeUnits = function(user, countryName, amount) {
      var country = this.countries[countryName];

      if(country.owner == user.id) {
          country.troopCount = country.troopCount - amount;
      }
      else {
        if(!country.others[user.id]) {
          country.others[user.id] = 0;
        }

        country.others[user.id] = country.others[user.id] - amount;
      }
  }

  this.moveAllTroops = function(user, args) {
    this.moveQueue.push({ 
      user: user.id, 
      count: 'all', 
      from: args.from, 
      to: args.to 
    });
  }

  this.moveSomeTroops = function(user, args) {
    var count = parseInt(args.count);

    if(isNaN(count)) return;

    this.moveQueue.push({ 
      user: user.id, 
      count: count, 
      from: args.from, 
      to: args.to 
    });
  }

  this.init = function(server) {
    this.server = server;

    this.countries['a'] = Country.new('a', null, 0);
    this.countries['b'] = Country.new('b', null, 0);
    this.countries['c'] = Country.new('c', null, 0);
    this.countries['d'] = Country.new('d', null, 0);
    this.countries['e'] = Country.new('e', null, 0);
    this.countries['f'] = Country.new('f', null, 0);
    this.countries['g'] = Country.new('g', null, 0);
    this.countries['h'] = Country.new('h', null, 0);
    this.countries['i'] = Country.new('i', null, 0);
    this.countries['j'] = Country.new('j', null, 0);
    this.countries['k'] = Country.new('k', null, 0);
    this.countries['l'] = Country.new('l', null, 0);
    this.countries['m'] = Country.new('m', null, 0);
    this.countries['n'] = Country.new('n', null, 0);
    this.countries['o'] = Country.new('o', null, 0);
    this.countries['p'] = Country.new('p', null, 0);
    this.countries['q'] = Country.new('q', null, 0);
    this.countries['r'] = Country.new('r', null, 0);
    this.countries['s'] = Country.new('s', null, 0);
    this.countries['t'] = Country.new('t', null, 0);
    
    this.intervalId = setInterval(proxy(this, this.broadcastGame), 1000);
  }

  this.createNpc = function() {
    var user = User.new('npc', 'npc', {});
    return user;
  }

  this.updateName = function(user, args) {
    this.users[user.id].name = args.userName;
  }

  this.processMethod = function(name, user, args) {
    //console.log(args);
    this[name](user, args);
  }

  function proxy(ctx, fn) {
    return function() {
      fn.call(ctx);
    }
  }
}

exports.new = function(gameId, isPrivate) {
  return new Game(gameId, isPrivate);
}

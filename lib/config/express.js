var express = require('express');

function Express() {

  this.init = function(app) {
    app.configure(function(){
      app.set('view engine', 'ejs');
      app.set('view options', { layout: false });
      app.use(express.methodOverride());
      app.use(express.bodyParser());  
      app.use(app.router);
      app.use('/public', express.static('public'));
    });

    app.get('/', function(req, res){
      var ticks = new Date().getTime(), rand = Math.floor(Math.random(1) * 1000000);
      
      res.render('index', { locals:{ guid: ticks +''+ rand }});
    });

    app.get('/game', function(req, res){
      res.render('game', {});
    });


    app.listen(process.env.PORT || 1337);

  };
}

exports.new = function() {
  return new Express();
}

  

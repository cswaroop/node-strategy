//============================================================
//=========== View ===========================================
//============================================================
modit('map.view', function() {
  var presenter;
  var $map;
  var $actions;
  var $notifications;
  var $startButton;
  var $updateUserName;
  var $modalWindows;

  var divLocations = {
    'a': { x: 84, y: 72 },
    'b': { x: 10, y: 216 },
    'c': { x: 223, y: 77 },
    'd': { x: 161, y: 225 },
    'e': { x: 71, y: 360 },
    'f': { x: 293, y: 188 },
    'g': { x: 228, y: 365 },
    'h': { x: 50, y: 494 },
    'i': { x: 30, y: 640 },
    'j': { x: 170, y: 560 },
    'k': { x: 170, y: 710 },
    'l': { x: 387, y: 25 },
    'm': { x: 506, y: 88 },
    'n': { x: 400, y: 206 },
    'o': { x: 365, y: 343 },
    'p': { x: 340, y: 480 },
    'q': { x: 300, y: 640 },
    'r': { x: 450, y: 650 },
    's': { x: 470, y: 540 },
    't': { x: 490, y: 345 }
  };
  
  function init(presenter_) {
    presenter = presenter_;
    $map = $("#map");
    $actions = $("#actions");
    $notifications = $("#notifications");
    $startButton = $("#startButton");
    $updateUserName = $("#updateUserName");
    $modalWindows = $('#modal');
    
    wireUpEvents();
  }

  function wireUpEvents() {
    $startButton.click(function() {
      presenter.startGame();
    });
  }

  function initializeCountries(countries) {
      for(var i in countries) {
        initCountry(countries[i]);
      }
  }

  function setCountryOwnership(name, player) {
    $("#" + name).removeClass();

    $("#" + name).addClass("country");
    if(player) $("#" + name).addClass("player" + player);
  }

  function initCountry(country) {
    var divLocation = divLocations[country.name];

    var $country = 
      $('<div class="country"></div>')
        .css({ 
          'top': divLocation.x, 
          'left': divLocation.y, 
          'border': 'solid 1px silver',
          'position': 'absolute',
          'width': '75px',
          'height': '75px',
          'cursor': 'pointer',
          '-moz-border-radius':'7px', 
          '-webkit-border-radius':'7px'
        })
        .attr('id', country.name);

    initCountryName($country, country.name);

    initCountryCount($country);

    $country.click(function() {
      $map.css({ 'background-image': backgroundImageNameFor(country.name) });
      presenter.actionsRequested(country);
    });

    $map.append($country);
  }

  function backgroundImageNameFor(name) {
       return "url('public/css/images/" + name + "_selected.png'), url('public/css/images/bg.jpg')";
  }

  function initCountryName($country, name) {
    $country.append($("<div class='countryname' />").html(name));
  }

  function initCountryCount($country) {
    var $wrapper = $("<div class='countrycounts' />");
    $wrapper.append($("<span class='countrycount countrycountplayer1' />").html("0"));
    $wrapper.append($("<span class='countrycount countrycountplayer2' />").html("0"));
    $wrapper.append($("<span class='countrycount countrycountplayer3' />").html("0"));
    $wrapper.append($("<span class='countrycount countrycountplayer4' />").html("0"));
    $wrapper.append($("<span class='countrycount countrycountplayernpc' />").html("0"));
    $country.append($wrapper);
  }

  function updateCountryCount(name, player, count) {
    $getCountryCount(name, player).html(count);
  }

  function $getCountryCount(name, player) {
    return $("#" + name + " .countrycountplayer" + player);
  }

  function generateActions(actions) {
    $('#action-panel').html(
      new EJS({ type:'[', element:'actions-template' }).render({
        troops: null, 
        country: null,
        actions: actions
      }));    
  }

  function $moveButtons(action) {
      var $troopInput = 
        $('<input type="text" placeholder="# of troops to send to ' + action.to + '" />');

      var $action = 
        $('<div></div>')
            .append($('<div />')
            .html(action.to))
            .append($moveAllButton(action))
            .append($('<span>or ...<br /></span>'))
            .append($troopInput)
            .append($moveSpecificButton(action, $troopInput))
            .append($('<hr />'));

      return $action;
  }

  function $moveAllButton(action) {
    var button = $('<input type="button" />').val("move all to " + action.to);
    
    button.click(function() {
      presenter.moveAllTroops(action.to);
    });

    return button;
  }

  function $moveSpecificButton(action, $troopInput) {
    var button = $('<input type="button" />').val(action.command);
    
    button.click(function() {
      presenter.moveSomeTroops(action.to, $troopInput.val());
    });

    return button;
  }

  function notify(message) {
    $notifications.append($('<div />').append(message));
  }

  function notifyYouWon() {
    this.notify('you are teh winnerz! Tigerblood!!!!');
    alert('winner');
  }

  function notifyYouLost() {
    this.notify('you are a big-time loser');
    alert('loser');
  }

  function userName(val) {
    if ($.cookie){
      val && $.cookie('nw_name', val);
      return $.cookie('nw_name');
    }
  }

  function showModalWindow( index ){
    $modalWindows.multiview('show', index);
  }

  function hideModalWindow( index ){
    $modalWindows.multiview('hide');
  }

  function actionConfirmed(message) {
    $("#action-list").append($("<li />").html(message));
  }

  function clearActions() {
    $("#action-list").html('');
  }

  function generateTurnResults(results) {
    $("#turn-results").html('');

    for(var r in results) {
      $("#turn-results").append($("<li />").html(results[r]));
    }
  }
  
  this.exports(init, 
      initializeCountries, 
      generateActions, 
      notify, 
      updateCountryCount,
      userName,
      showModalWindow,
      hideModalWindow,
      setCountryOwnership,
      actionConfirmed,
      clearActions,
      notifyYouWon,
      notifyYouLost,
      generateTurnResults);
});


//============================================================
//=========== Presenter ======================================
//============================================================
modit('map.presenter', ['map.view', 'com'], function(view, com) {
  var connections = {
    'a': ['b', 'c', 'd'],
    'b': ['a'],
    'c': ['a', 'd', 'f'],
    'd': ['e', 'c', 'g'],
    'e': ['h', 'd'],
    'f': ['c', 'g', 'n', 'm' ],
    'g': ['d', 'j', 'p', 'o', 'f'],
    'h': ['e', 'i', 'j'],
    'i': ['h'],
    'j': ['h', 'k', 'g'],
    'k': ['j'],
    'l': ['m'],
    'm': ['l', 'n', 'f'],
    'n': ['o', 'f', 'm'],
    'o': ['n', 't', 'p', 'g'],
    'p': ['g', 'o', 's', 'r'],
    'q': ['r'],
    'r': ['s', 'p', 'q'],
    's': ['p', 'r'],
    't': ['o']
  };

  //var gameId = getGameId();
  var gameId = getQueryStringValue('gameid');
  var currentName = null;
  var currentCountry = null;
  var privateFlag = getQueryStringValue('private');
  var myCountries = [];

  function init() {
    view.init(this);

    //console.log('teh new game id', getQueryStringValue('gameid'));
    //console.log('teh new privates', getQueryStringValue('private'));

    //console.log('game id', gameId);
    //console.log('private flag', privateFlag);
    
    var args = { gameId: gameId, isPrivateGame: privateFlag === 'true' };
    //console.log('args yo', args);
 
    com.send('gameLister', {
      command: 'joinGame', 
      args: args
    });

    view.initializeCountries(
      [
        { name: 'a' },
        { name: 'b' },
        { name: 'c' },
        { name: 'd' },
        { name: 'e' },
        { name: 'f' },
        { name: 'g' },
        { name: 'h' },
        { name: 'i' },
        { name: 'j' },
        { name: 'k' },
        { name: 'l' },
        { name: 'm' },
        { name: 'n' },
        { name: 'o' },
        { name: 'p' },
        { name: 'q' },
        { name: 'r' },
        { name: 's' },
        { name: 't' } 
      ]);

      initSockets();
  }

  function getGameId() {
    var privateIndex = window.location.href.indexOf('private');
    if (privateIndex === -1) {
      return window.location.href.substring(window.location.href.indexOf('gameid') + 7);
    }
    else {
      console.log('herez');
      var length = privateIndex - (window.location.href.indexOf('gameid') + 7);
      return window.location.href.substr(window.location.href.indexOf('gameid') + 7, length - 1);
    }
  }

  function getPrivateFlag() {
    return window.location.href.substring(window.location.href.indexOf('private') + 8);
  }

  function getQueryStringValue(keyName) {
    var indexOfStart = window.location.href.indexOf('?') + 1;
    var variableString = window.location.href.substring(indexOfStart);
    console.log('variable string', variableString);

    var values = variableString.split("&");
    for (i = 0; i < values.length; i++) {
      var kvp = values[i].split("=");
      if (kvp[0] == keyName) {
        return kvp[1];
      }
    }
  }

  function initSockets() {
    com.listenFor('gameState', updateGame);
  }

  function updateGame(d) {
    /* Am I the host? How many people are connected? */
    var is_host = false, count = 0;
    for (var u in d.users){
      if (u == d.forUser){
        if (count == 0 ){ is_host = true; }
        var model = d.users[u];
        window.CurrentUser = {
          id: model.id,
          name: model.name,
          totalTroops: model.totalTroops,	
          troopCap: model.troopCap
        };      
      }
      if (u.id !== 'npc') { count++; }
    }
        
    /* 
     * TODO: This doesn't seem like it belongs here. 
     */     
    $('.player_count').text(count);
     
    if (d.gameStarted) {
      if(isNewTurn(d)) {
        view.clearActions();
      }

      // view.generateTurnResults(d.turnResults[d.forUser]);

      updateCountdown(d.countdown);
      updateCountryCounts(d);
      updateTroopCaps( window.CurrentUser );
      setCountryOwnership(d.countries, d.users);
      view.hideModalWindow();
      $('body').addClass('game-started');      
      console.log('game data', d);
      if (d.forUser == d.winnerUserId)
        view.notifyYouWon();

      for (var userId in d.users) {
        if (d.forUser == d.users[userId].id && d.users[userId].isALoser)
          view.notifyYouLost();
      }
    }
    else
    {            
      if (is_host && count <= 1){ view.showModalWindow(0); }
      else if (is_host && count >= 2){ view.showModalWindow(1); }
      else{ view.showModalWindow(2); }
    }    
  }

  function isNewTurn(d) {
    return d.countdown == 15;
  }

  function updateTroopCaps( user ){
    var parent = $('#troop-counts');
      parent.find('.tcount').text( user.totalTroops );
      parent.find('.tcap').text( user.troopCap );  
  };
  
  function updateCountryCounts(d) {
    var countries = d.countries;
    myCountries.length = 0;

    //update country counts
    for(var c in countries) {
      var owner = countries[c].owner;

      if(d.forUser == owner) {
        myCountries.push(c);
      }
    }

    //apply fog of war or show country info
    for(var c in countries) {
      if(isAdjacentToOwnedCountryOrOwned(c)) {
        generateInfoForCountry(d, c);
      }
      else {
        fogCountry(c);
      }
    }
  }

  function fogCountry(country) {
    view.updateCountryCount(country, 1, "?");
    view.updateCountryCount(country, 2, "?");
    view.updateCountryCount(country, 3, "?");
    view.updateCountryCount(country, 4, "?");
    view.updateCountryCount(country, "npc", "?");
    view.setCountryOwnership(country, "");
  }

  function isAdjacentToOwnedCountryOrOwned(country) {
    for(var owned in myCountries) {
      if(connections[myCountries[owned]].indexOf(country) > -1) return true;
    }

    if(isOwned(country)) return true;

    return false;
  }

  function isOwned(country) {
    return myCountries.indexOf(country) > -1;
  }

  function generateInfoForCountry(d, country) {
    var countries = d.countries;
    var owner = countries[country].owner;

    var workingCountry = countries[country];
    resetCountry(workingCountry.name);

    if(owner) {
      var playerNumber = "npc";
      
      if(owner != "npc") playerNumber = d.users[owner].number;

      view.updateCountryCount(countries[country].name, playerNumber, countries[country].troopCount);
    }
    
    //others
    for(var o in workingCountry.others) {
      var troopCount = workingCountry.others[o];
      if(troopCount && d.users[o]) {
        var otherPlayer = d.users[o].number;
        view.updateCountryCount(countries[country].name, otherPlayer, troopCount);
      }
    }
  }

  function resetCountry(country) {
    view.updateCountryCount(country, 1, 0);
    view.updateCountryCount(country, 2, 0);
    view.updateCountryCount(country, 3, 0);
    view.updateCountryCount(country, 4, 0);
    view.updateCountryCount(country, "npc", 0);
    view.setCountryOwnership(country, '');
  }

  function setCountryOwnership(countries, users) {
    for(var c in countries) {
      var country = countries[c];
      var owner = country.owner;

      if(users[owner] && isAdjacentToOwnedCountryOrOwned(country.name)) {
        view.setCountryOwnership(c, users[owner].number);
      }

      if(owner == "npc" && isAdjacentToOwnedCountryOrOwned(country.name)) {
        view.setCountryOwnership(c, "npc");
      }
    }
  }
 
  function updateUserName(value) {
    com.send('game', { command: 'updateName', args: { userName : value } });
  }
  
  function updateCountdown(value){
    $('#timer').text("00:" + (value < 10 ? "0"+value : value));  
  }

  function actionsRequested(country) {
    var actions = {
      availableCommands: []
    };

    if(!isOwned(country.name)) 
    {
      view.generateActions(actions); 
      return;
    }

    currentCountry = country.name;

    var adjacent = connections[country.name];

    for(var a in adjacent) {
      actions.availableCommands.push({ command: 'move', to: adjacent[a] });
    }

    view.generateActions(actions);
  }

  function moveAllTroops(to) {
    view.actionConfirmed("Queued: Movin' all but 1 from " + currentCountry + " to " + to);
    com.send('game', { command: 'moveAllTroops', args: { from: currentCountry, to: to } });
  }

  function moveSomeTroops(to, count) {
    view.actionConfirmed("Queued: Movin' " + count + " troop(s) from " + currentCountry + " to " + to);
    com.send('game', { command: 'moveSomeTroops', args: { from: currentCountry, to: to, count: count } });
  }

  function startGame() {
    com.send('game', { command: 'startGame', args: { gameId: gameId } });    
    /*TODO: No one else gets this notification except the primary user? */
    view.hideModalWindow();
  }

  this.exports(init, actionsRequested, startGame, updateUserName, moveAllTroops, moveSomeTroops);
});

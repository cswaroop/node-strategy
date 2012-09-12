var Battle = require('./battle.js');

function Country() {
  this.setConqueror = function(turnResults) {
    if(this.isOccupiedByOthers() == false) return;

    if(this.isOwned()) return;

    var lastManStanding = this.lastManStanding();

    if(lastManStanding == false) return;

    this.owner = lastManStanding;

    this.troopCount = this.others[lastManStanding];

    this.clearOthers();

    this.recentlyConquered = true;

    //turnResults[this.owner].push("You conquered " + this.name + ".");
  }

  this.buildTroops = function(troopCap) {
    var troopsToGenerate = 0;
    if(this.isOwned() == false) return "";
    if(this.recentlyConquered) return "";
    if (this.owner === 'npc') return "";
    else if(troopCap[this.owner].left >= 5) troopsToGenerate = 5;
    else troopsToGenerate = troopCap[this.owner].left;

    if(troopsToGenerate > 0) {
      this.troopCount = this.troopCount + troopsToGenerate;
    }

    return troopsToGenerate + " troop(s) where generated on " + this.name + ".";
  }

  this.clearOthers = function() {
    this.others = { };
  }

  this.isOccupiedByOthers = function() {
    for(var o in this.others) {
      if(this.others[o]) return true;
    }

    return false;
  }

  this.isOwned = function () {
    if(this.owner == null) return false;
    if(this.troopCount <= 0) return false;
    return true;
  }

  this.lastManStanding = function() {
    var lastMan = null;

    for(var o in this.others) {
      if(!!lastMan && this.others[o]) return null;

      if(this.others[o]) lastMan = o;
    }

    return lastMan;
  }

  this.battle = function(turnResults) {
    if(this.isOccupiedByOthers() == false)
      return;


    var battle = Battle.new();

    for(var o in this.others) {

      
      var troopCount = this.others[o];
      if (troopCount === 0 || troopCount == undefined) continue;
      var results = battle.fight(this.troopCount, troopCount);    
      this.troopCount = results.defender.troopsRemaining;
      o.troopCount = results.attacker.troopsRemaining;

      //if (this.troopCount == 0) {
      //  continue;
      //}

      /*
      if (this.troopCount == 0) {
        turnResults[this.owner].push('You lost country ' + this.name + '. You have been pwned. You need more ninjas.');
        turnResults[o].push('You have crushed the enemy ninjas in region ' + this.name + '. You may now loot freely.');
      }
      else if (o.troopCount == 0) {
        turnResults[this.owner].push('You defeated the scrawny ninjas of your enemy for country ' + this.name);
        turnResults[o].push('Your ninjas are inferior because they were defeated in country ' + this.name);
      }
      else {
        turnResults[this.owner].push('You kept region ' + this.name + ' but the battle rages on. You now have ' + 
          this.troopCount + ' ninjas left. They still have ' + o.troopCount + ' ninjas in your territory');
        turnResults[this.owner].push('You are still fighting for region ' + this.name + '. You now have ' + 
          o.troopCount + ' ninjas left. They still have ' + this.troopCount + ' ninjas defending your territory');
      }
      */

      console.log('battle results', results);
    }

  }
}

exports.new = function(name, owner, troopCount) {
  var country = new Country();
  country.name = name;
  country.owner = owner;
  country.troopCount = troopCount;
  country.others = { };
  country.recentlyConquered = false;

  return country;
}

  

function Battle() {

  this.fight = function(defenderTroopCount, attackerTroopCount) {

    console.log('defenders: ' + defenderTroopCount + ', attackers: ' + attackerTroopCount);

    //Setup, yo
    var modifier = 0;
    var defenderIsAtAdvantage = null;
    var advantageCount = 0;
    var disadvantageCount = 0;
    if (defenderTroopCount > attackerTroopCount) {
      modifier = 1;
      defenderIsAtAdvantage = true;
      advantageCount = defenderTroopCount;
      disadvantageCount = attackerTroopCount;
    }
    else if (defenderTroopCount < attackerTroopCount) {
      modifier = 1;
      defenderIsAtAdvantage = false;
      advantageCount = attackerTroopCount;
      disadvantageCount = defenderTroopCount;
    }
    else {
      modifier = 0;
      defenderIsAtAdvantage = true;
      advantageCount = defenderTroopCount;
      disadvantageCount = attackerTroopCount;
    }

    //base scores
    var advantageHits = 0;
    var disadvantageHits = 0;

    for (var i = 0; i < advantageCount; i++) {
      var advScore = Math.floor(Math.random() * (10 + modifier));
      var defScore = Math.floor(Math.random() * 10);

      if (i > disadvantageCount) {
        advScore = advScore * 2;
      }

      if (advScore > defScore) {
        advantageHits++;
      }
      else if (defScore > advScore) {
        disadvantageHits++;
      }
    }

    console.log('');
    console.log('advantageHits', advantageHits);
    console.log('disadvantageHits', disadvantageHits);
    
    //Apply kills
    var percentage = null;
    var totalKillable = Math.ceil((disadvantageCount + advantageCount) / 2);
    console.log('total killable', totalKillable);
    var disadvantageDeaths = 0;
    var advantageDeaths = 0;
    if (advantageHits > disadvantageHits) {
      percentage = (advantageHits / (advantageHits + disadvantageHits));
      disadvantageDeaths = Math.ceil(percentage * totalKillable);
      advantageDeaths = totalKillable - disadvantageDeaths;
    }
    else if (advantageHits < disadvantageHits) {
      percentage = (disadvantageHits / (advantageHits + disadvantageHits));
      advantageDeaths = Math.ceil(percentage * totalKillable);
      disadvantageDeaths = totalKillable - advantageDeaths;
    }
    else {
      percentage = 1;
      advantageDeaths = disadvantageDeaths = Math.ceil(totalKillable / 2);
    }
    //console.log('percentage ' + percentage);
    //console.log('disadvantageDeaths', disadvantageDeaths);
    //console.log('advantageDeaths', advantageDeaths);

    advantageCount -= advantageDeaths;
    disadvantageCount -= disadvantageDeaths;

    if (advantageCount > (disadvantageCount * 3)) {
      if (Math.random() > .5) {
        console.log('disadvantageCount', disadvantageCount);
        disadvantageDeaths = disadvantageCount;
        console.log('rout!');
      }
    }



    if (defenderIsAtAdvantage) {
      defenderTroopCount = advantageCount;
      attackerTroopCount = disadvantageCount;
    }
    else {
      attackerTroopCount = advantageCount;
      defenderTroopCount = disadvantageCount;
    }

    defenderTroopCount = Math.floor(defenderTroopCount);
    attackerTroopCount = Math.floor(attackerTroopCount);

    if (defenderTroopCount < 0)
      defenderTroopCount = 0;
    if (attackerTroopCount < 0)
      attackerTroopCount = 0;

    return {
      defender: {
        troopsRemaining: defenderTroopCount
      },
      attacker: {
        troopsRemaining: attackerTroopCount
      }
    };
  }

}

exports.new = function() {
  var battle = new Battle();
  return battle;
}
/*
console.log('');
console.log('');
console.log('');

for (var i = 0; i < 1; i++) {
  var battle = new Battle();
  var defenderCount = 300;
  var attackerCount = 1000000;

  var rounds = 0;

  while (defenderCount > 0 && attackerCount > 0) {

    console.log('defenders: ' + defenderCount);
    console.log('attackers: ' + attackerCount);
    var results = battle.fight(defenderCount, attackerCount);
  
    defenderCount = results.defender.troopsRemaining;
    attackerCount = results.attacker.troopsRemaining;

    console.log('defenders after: ' + defenderCount);
    console.log('attackers after: ' + attackerCount);

    console.log('');
    rounds++;

    if (rounds > 10) {
      console.log('too many rounds fail');
      break;
    }  
  }

  console.log('rounds', rounds);

  if (defenderCount = 0)
    console.log('defender lost');
  else if (attackerCount == 0)
    console.log('attacker lost');
  //else
  //  console.log('too many iterations');
}

//console.log('rounds', rounds);

*/


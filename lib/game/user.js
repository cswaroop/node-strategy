function User() {


  this.init = function() {
  };

  this.isNpc = function() {
    if (id === 'npc')
      return true;
    else
      return false;
  }
}

exports.new = function(id, userName, socket) {
  var user = new User();
  user.id = id;
  user.userName = userName;
  user.socket = socket;
  user.isALoser = false;
  user.isWinner = false;
  return user;
}

//if 2 players, A and R
//if 4 players, also M and H

  

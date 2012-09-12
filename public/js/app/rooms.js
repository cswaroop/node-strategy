modit('rooms.view', ['com'], function(com) {

  function init() {
    com.listenFor('rooms', function( data ) {
      $('#rooms').html(new EJS({ type:'[', element:'room-template' }).render(data));  
    });
  }

  this.exports(init);
});



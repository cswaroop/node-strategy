modit('com', function() {
  var socket = io.connect('');
  socket.on('howdy', function (data) {
    console.log('teh news', data);
    socket.emit('my other event', { my: 'data' });

  });

  function doAThing() {
    socket.emit('something', { zing : 'ting' });
  }
  
  function doACoolThing() {
    console.log('doin it');
  }

  function listenFor(name, callback) {
    socket.on(name, callback);
  }

  function send(name, data) {
    socket.emit(name, data);
  }

  this.exports(listenFor, send);
});

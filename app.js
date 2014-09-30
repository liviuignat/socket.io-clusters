var Server = require('./app/server').Server;
var cluster = require('cluster');
var os = require('os');
var sticky = require('sticky-session');

var numCPUs = os.cpus().length;
console.log('CPUS : ' + numCPUs);

if (cluster.isMaster) {
  sticky(function() {
    var server = new Server({
        dirName: __dirname,
        enableSocket: true
      })
      .setupApp()
      .setupRoutes();
    return server.http;
  }).listen(3000, function() {
    console.log('server started on 3000 port');
  });

  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
  sticky(function() {
    var server = new Server({
        dirName: __dirname,
        enableSocket: true
      })
      .setupApp()
      .setupRoutes();
    return server.http;
  }).listen(3000, function() {
    console.log('server started on 3000 port');
  });
}

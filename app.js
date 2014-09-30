var Server = require('./app/server').Server;
var cluster = require('cluster');
var os = require('os');

var numCPUs = os.cpus().length;
console.log('CPUS : ' + numCPUs);

if (cluster.isMaster) {
  var server = new Server({
      dirName: __dirname,
      enableSocket: true
    })
    .setupApp()
    .setupRoutes()
    .start();

  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
  var server = new Server({
      dirName: __dirname,
      enableSocket: true
    })
    .setupApp()
    .setupRoutes()
    .start();
}

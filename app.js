var Server = require('./app/server').Server;


var server = new Server({
    dirName: __dirname,
  })
  .setupApp()
  .setupRoutes()
  .start();
//.startClusters();

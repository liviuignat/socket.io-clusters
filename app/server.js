var cluster = require('cluster');
var os = require('os');

var util = require('util');
var path = require('path');
var redis = require('redis');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var expressSession = require('express-session');
var RedisStore = require('connect-redis')(expressSession);
var compression = require('compression');
var errorhandler = require('errorhandler');
var methodOverride = require('method-override');
var serveStatic = require('serve-static');
var socketIo = require("socket.io");
var socketRedis = require("socket.io-redis");
var expressLayouts = require('express-ejs-layouts');
var config = require('config');

var routes = require('./routes');

var Server = function(options) {
  this.options = options;
  this.app = express();
  this.router = new express.Router();
};

Server.prototype.start = function() {
  var serverPort = config.server.port;

  var server = this.app.listen(serverPort, function(err) {
    if (err) {
      console.error('Error: ' + err);
      return process.exit(1);
    }

    console.log('%s: Node server started on port %d ... Cluster id: %d', new Date(Date.now()), serverPort, cluster.worker ? cluster.worker.id : 'none');
  });

  return this;
};

Server.prototype.setupApp = function() {
  var sessionRedisClient = redis.createClient(config.redis.port, config.redis.host);
  sessionRedisClient.auth(config.redis.password);

  this.app.use(compression());
  this.app.set('views', path.join(this.options.dirName, 'app/views'));
  this.app.set('view engine', 'ejs');
  this.app.use(serveStatic(path.join(this.options.dirName, 'app/public')));
  this.app.use(expressSession({
    key: 'sessionid',
    secret: 'my_super_secret_key',
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1 * 60 * 60 * 1000
    },
    store: new RedisStore({
      client: sessionRedisClient,
      url: config.redis.url
    })
  }));
  this.app.set('layout', '_layout.html');
  this.app.engine('html', require('ejs').renderFile);
  this.app.use(expressLayouts);

  this.app.use(bodyParser.urlencoded({
    extended: true
  }));
  this.app.use(bodyParser.json({
    extended: true
  }));
  this.app.use(methodOverride());
  this.app.use(this.router);
  this.app.use(errorhandler());

  return this;
};

Server.prototype.setupRoutes = function() {
  this.app.get('/', routes.indexGet);
  return this;
};

module.exports.Server = Server;

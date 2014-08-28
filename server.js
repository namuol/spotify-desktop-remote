(function() {
  var allowCrossDomain, app, express, getParams, io, server, spotify_socket, _ref,
    __hasProp = {}.hasOwnProperty;

  express = require('express');

  app = express();

  server = require('http').createServer(app);

  io = require('socket.io').listen(server);

  allowCrossDomain = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  };

  app.use(allowCrossDomain);

  app.use(require('serve-static')(__dirname));

  app.use(function(req, res, next) {
    if (!spotify_socket) {
      return res.status(400).send('Not connected to the player! Ensure you are <a href="spotify:app:spotify-desktop-remote">running the app</a>.');
    }
    return next();
  });

  getParams = function(req) {
    var k, result, v, _ref;
    result = {};
    _ref = req.params;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      v = _ref[k];
      result[k] = v;
    }
    return result;
  };

  spotify_socket = null;

  io.on('connection', function(socket) {
    socket.on('__player_connected__', function() {
      spotify_socket = socket;
      spotify_socket.on('disconnect', function() {
        return spotify_socket = null;
      });
      return spotify_socket.on('player.change', function(data) {
        return spotify_socket.broadcast.emit('player.change', data);
      });
    });
    socket.on('pause', function() {
      return spotify_socket != null ? spotify_socket.emit('pause') : void 0;
    });
    socket.on('stop', function() {
      return spotify_socket != null ? spotify_socket.emit('stop') : void 0;
    });
    socket.on('nextTrack', function() {
      return spotify_socket != null ? spotify_socket.emit('nextTrack') : void 0;
    });
    socket.on('prevTrack', function() {
      return spotify_socket != null ? spotify_socket.emit('prevTrack') : void 0;
    });
    socket.on('volume', function(level) {
      return spotify_socket != null ? spotify_socket.emit('volume', level) : void 0;
    });
    socket.on('seek', function(amount) {
      return spotify_socket != null ? spotify_socket.emit('seek', amount) : void 0;
    });
    socket.on('play', function(params) {
      if (/^spotify:track:[^:]+$/.test(params != null ? params.uri : void 0)) {
        return spotify_socket.emit('playTrack', params);
      } else if (/^spotify:(user:[^:]+:playlist|album):[^:]+$/.test(params != null ? params.uri : void 0)) {
        return spotify_socket.emit('playContext', params);
      } else {
        return spotify_socket.emit('play');
      }
    });
    app.get('/volume/:volume', function(req, res, next) {
      return spotify_socket.emit('volume', getParams(req).volume, function(err, data) {
        if (data == null) {
          data = {};
        }
        if (err) {
          return res.status(500).send(err);
        }
        return res.send(data);
      });
    });
    app.get('/stop', function(req, res, next) {
      return spotify_socket.emit('stop', function(err, data) {
        if (data == null) {
          data = {};
        }
        if (err) {
          return res.status(500).send(err);
        }
        return res.send(data);
      });
    });
    app.get('/pause', function(req, res, next) {
      return spotify_socket.emit('pause', function(err, data) {
        if (data == null) {
          data = {};
        }
        if (err) {
          return res.status(500).send(err);
        }
        return res.send(data);
      });
    });
    app.get('/play', function(req, res, next) {
      return spotify_socket.emit('play', function(err, data) {
        if (data == null) {
          data = {};
        }
        if (err) {
          return res.status(500).send(err);
        }
        return res.send(data);
      });
    });
    app.get('/nextTrack', function(req, res, next) {
      return spotify_socket.emit('nextTrack', function(err, data) {
        if (data == null) {
          data = {};
        }
        if (err) {
          return res.status(500).send(err);
        }
        return res.send(data);
      });
    });
    app.get('/prevTrack', function(req, res, next) {
      return spotify_socket.emit('prevTrack', function(err, data) {
        if (data == null) {
          data = {};
        }
        if (err) {
          return res.status(500).send(err);
        }
        return res.send(data);
      });
    });
    app.get(/^\/play\/(spotify:track:[^:]+)(\/([0-9]+))?(\/([0-9]+))?/, function(req, res, next) {
      var params;
      params = {
        uri: req.params[0],
        ms: req.params[2],
        duration: req.params[4]
      };
      return spotify_socket.emit('playTrack', params, function(err, data) {
        if (data == null) {
          data = {};
        }
        if (err) {
          return res.status(500).send(err);
        }
        return res.send(data);
      });
    });
    app.get(/^\/play\/(spotify:(user:[^:]+:playlist|album):[^:]+)(\/([0-9]+))?(\/([0-9]+))?(\/([0-9]+))?/, function(req, res, next) {
      var params;
      params = {
        uri: req.params[0],
        index: req.params[4],
        ms: req.params[6],
        duration: req.params[8]
      };
      return spotify_socket.emit('playContext', params, function(err, data) {
        if (data == null) {
          data = {};
        }
        if (err) {
          return res.status(500).send(err);
        }
        return res.send(data);
      });
    });
    app.get('/sync', function(req, res, next) {
      return spotify_socket.emit('sync', function(err, data) {
        if (data == null) {
          data = {};
        }
        if (err) {
          return res.status(500).send(err);
        }
        return res.send(data);
      });
    });
    return app.get('/seek/:amount', function(req, res, next) {
      return spotify_socket.emit('seek', getParams(req).amount, function(err, data) {
        if (data == null) {
          data = {};
        }
        if (err) {
          return res.status(500).send(err);
        }
        return res.send(data);
      });
    });
  });

  server.listen((_ref = process.env.PORT) != null ? _ref : 3001);

}).call(this);

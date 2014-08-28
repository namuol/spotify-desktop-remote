(function() {
  require(['$api/models'], function(models) {
    var available_songs, currentStatus, socket;
    window.models = models;
    Number.prototype.clamp = function(min, max) {
      return Math.min(Math.max(this, min), max);
    };
    models.Promise.prototype.then = function(onResolved, onRejected) {
      return (new Promise((function(_this) {
        return function(resolve, reject) {
          _this.done(function(value) {
            return resolve(value);
          });
          return _this.fail(function(reason) {
            return reject(reason);
          });
        };
      })(this))).then(onResolved, onRejected);
    };
    models.player.load('volume');
    available_songs = {};
    socket = io.connect('http://localhost:3001');
    socket.on('connect', function() {
      var status;
      socket.emit('__player_connected__');
      status = document.getElementById('status');
      return status.className = status.innerHTML = 'connected';
    });
    socket.on('disconnect', function() {
      var status;
      status = document.getElementById('status');
      return status.className = status.innerHTML = 'disconnected';
    });
    socket.on('volume', function(volume, cb) {
      console.log('volume', volume);
      return models.player.load('volume').then(function(player) {
        if (volume == null) {
          volume = player.volume;
        }
        return models.player.setVolume(parseFloat(volume).clamp(0, 1));
      }).then(function(player) {
        return cb(null, currentStatus);
      }, function(err) {
        return cb(err);
      });
    });
    socket.on('stop', function(cb) {
      console.log('stop');
      return models.player.stop().then(function() {
        return cb(null, currentStatus);
      }, function(err) {
        console.error(err);
        return cb('Failed to stop.');
      });
    });
    socket.on('pause', function(cb) {
      console.log('pause');
      return models.player.pause().then(function() {
        return cb(null, currentStatus);
      }, function(err) {
        console.error(err);
        return cb('Failed to pause.');
      });
    });
    socket.on('play', function(cb) {
      console.log('play');
      models.player.pause();
      return models.player.play().then(function() {
        return cb(null, currentStatus);
      }, function(err) {
        console.error(err);
        return cb('Failed to play.');
      });
    });
    socket.on('nextTrack', function(cb) {
      console.log('nextTrack');
      return models.player.skipToNextTrack().then(function() {
        return cb(null, currentStatus);
      }, function(err) {
        console.error(err);
        return cb('Failed to skip to next track.');
      });
    });
    socket.on('prevTrack', function(cb) {
      console.log('prevTrack');
      return models.player.skipToPrevTrack().then(function() {
        return cb(null, currentStatus);
      }, function(err) {
        console.error(err);
        return cb('Failed to skip to prev track.');
      });
    });
    socket.on('playContext', function(params, cb) {
      var duration, index, ms, uri;
      console.log('playContext', params);
      uri = params.uri, index = params.index, ms = params.ms, duration = params.duration;
      models.player.pause();
      return models.player.playContext(models.Context.fromURI(uri), index, parseFloat(ms), parseFloat(duration)).then(function() {
        return cb(null, currentStatus);
      }, function(err) {
        console.error(err);
        return cb('Failed to play ' + uri);
      });
    });
    socket.on('playTrack', function(params, cb) {
      var duration, ms, uri;
      console.log('playTrack', params);
      uri = params.uri, ms = params.ms, duration = params.duration;
      models.player.pause();
      return models.player.playTrack(models.Track.fromURI(uri), parseFloat(ms), parseFloat(duration)).then(function() {
        return cb(null, currentStatus);
      }, function(err) {
        console.error(err);
        return cb('Failed to play ' + uri);
      });
    });
    socket.on('sync', function(cb) {
      console.log('sync');
      return cb(null, currentStatus);
    });
    socket.on('seek', function(amount, cb) {
      console.log('seek', amount);
      return models.player.load('volume', 'playing', 'position', 'duration', 'track').then(function(player) {
        return player.seek(player.duration * parseFloat(amount));
      }).then(function(player) {
        return cb(null, currentStatus);
      }, function(err) {
        console.error(err);
        return cb('Failed to seek to ' + amount);
      });
    });
    currentStatus = null;
    return models.player.addEventListener('change', function(event) {
      currentStatus = event.data;
      return socket.emit('player.change', currentStatus);
    });
  });

}).call(this);

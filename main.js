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
      socket.emit('__playerConnected__');
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
        return typeof cb === "function" ? cb(null, currentStatus) : void 0;
      }, function(err) {
        return typeof cb === "function" ? cb(err) : void 0;
      });
    });
    socket.on('stop', function(cb) {
      console.log('stop');
      return models.player.stop().then(function() {
        return typeof cb === "function" ? cb(null, currentStatus) : void 0;
      }, function(err) {
        console.error(err);
        return typeof cb === "function" ? cb('Failed to stop.') : void 0;
      });
    });
    socket.on('pause', function(cb) {
      console.log('pause');
      return models.player.pause().then(function() {
        return typeof cb === "function" ? cb(null, currentStatus) : void 0;
      }, function(err) {
        console.error(err);
        return typeof cb === "function" ? cb('Failed to pause.') : void 0;
      });
    });
    socket.on('play', function(cb) {
      console.log('play');
      models.player.pause();
      return models.player.play().then(function() {
        return typeof cb === "function" ? cb(null, currentStatus) : void 0;
      }, function(err) {
        console.error(err);
        return typeof cb === "function" ? cb('Failed to play.') : void 0;
      });
    });
    socket.on('nextTrack', function(cb) {
      console.log('nextTrack');
      return models.player.skipToNextTrack().then(function() {
        return typeof cb === "function" ? cb(null, currentStatus) : void 0;
      }, function(err) {
        console.error(err);
        return typeof cb === "function" ? cb('Failed to skip to next track.') : void 0;
      });
    });
    socket.on('prevTrack', function(cb) {
      console.log('prevTrack');
      return models.player.skipToPrevTrack().then(function() {
        return typeof cb === "function" ? cb(null, currentStatus) : void 0;
      }, function(err) {
        console.error(err);
        return typeof cb === "function" ? cb('Failed to skip to prev track.') : void 0;
      });
    });
    socket.on('playContext', function(params, cb) {
      var duration, index, ms, uri;
      console.log('playContext', params);
      uri = params.uri, index = params.index, ms = params.ms, duration = params.duration;
      models.player.pause();
      return models.player.playContext(models.Context.fromURI(uri), index, parseFloat(ms), parseFloat(duration)).then(function() {
        return typeof cb === "function" ? cb(null, currentStatus) : void 0;
      }, function(err) {
        console.error(err);
        return typeof cb === "function" ? cb('Failed to play ' + uri) : void 0;
      });
    });
    socket.on('playTrack', function(params, cb) {
      var duration, ms, uri;
      console.log('playTrack', params);
      uri = params.uri, ms = params.ms, duration = params.duration;
      models.player.pause();
      return models.player.playTrack(models.Track.fromURI(uri), parseFloat(ms), parseFloat(duration)).then(function() {
        return typeof cb === "function" ? cb(null, currentStatus) : void 0;
      }, function(err) {
        console.error(err);
        return typeof cb === "function" ? cb('Failed to play ' + uri) : void 0;
      });
    });
    socket.on('sync', function(cb) {
      console.log('sync');
      return typeof cb === "function" ? cb(null, currentStatus) : void 0;
    });
    socket.on('seek', function(amount, cb) {
      console.log('seek', amount);
      return models.player.load('volume', 'playing', 'position', 'duration', 'track').then(function(player) {
        return player.seek(player.duration * parseFloat(amount));
      }).then(function(player) {
        return typeof cb === "function" ? cb(null, currentStatus) : void 0;
      }, function(err) {
        console.error(err);
        return typeof cb === "function" ? cb('Failed to seek to ' + amount) : void 0;
      });
    });
    socket.on('getPlaylist', function(uri, cb) {
      console.log('getPlaylist', uri);
      return models.Playlist.fromURI(uri).load('name', 'tracks', 'owner').then(function(playlist) {
        if (playlist.tracks.snapshot == null) {
          return typeof cb === "function" ? cb(null, playlist) : void 0;
        } else {
          console.log('snapshotting...');
          return playlist.tracks.snapshot().then(function(tracks) {
            console.log('snapshotted!', tracks, playlist);
            playlist.tracks = tracks.toArray();
            return typeof cb === "function" ? cb(null, playlist) : void 0;
          }, function(err) {
            console.error(err);
            return typeof cb === "function" ? cb('Failed to retrieve playlist ' + uri) : void 0;
          });
        }
      }, function(err) {
        console.error(err);
        return typeof cb === "function" ? cb('Failed to retrieve playlist ' + uri) : void 0;
      });
    });
    currentStatus = null;
    return models.player.addEventListener('change', function(event) {
      currentStatus = event.data;
      return socket.emit('player.change', currentStatus);
    });
  });

}).call(this);

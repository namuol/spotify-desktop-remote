require ['$api/models'], (models) ->
  Number::clamp = (min, max) ->
    Math.min Math.max(this, min), max

  # Extend Spotify's built in Promise to support promises/A+ spec, for sanity:
  models.Promise::then = (onResolved, onRejected) ->
    (new Promise (resolve, reject) =>
      @done (value) -> resolve value
      @fail (reason) -> reject reason
    ).then onResolved, onRejected

  models.player.load('volume')

  available_songs = {}
  
  playlist = null
  
  models.Playlist.createTemporary('SPOTIFY_REMOTE_TEMP').done (_playlist) ->
    playlist = _playlist
    playlist.load('tracks')

  socket = io.connect 'http://localhost:3001'

  socket.on 'connect', ->
    status = document.getElementById 'status'
    status.className = status.innerHTML = 'connected'

  socket.on 'disconnect', ->
    status = document.getElementById 'status'
    status.className = status.innerHTML = 'disconnected'
  
  getStatus = (cb) ->
    models.player.load('volume', 'playing', 'position', 'duration', 'track', 'index')
      .fail (err) ->
        console.error err
        cb 'Failed to retrieve sync info.'
      .done (player) ->
        # HACK: This is the only way to ensure the "position" attribute is up-to-date:
        if player.playing
          player.play()

        cb null, {
          volume: player.volume
          playing: player.playing
          duration: player.duration
          position: player.position
          track: player.track?.uri.replace 'spotify:track:', ''
          index: player.index
        }

  socket.on 'volume', (params, cb) ->
    console.log 'volume', params
    {volume} = params
    models.player.load('volume').then (player) ->
      volume ?= player.volume
      models.player.setVolume(parseFloat(volume).clamp(0,1))
    .then (player) ->
      getStatus cb
    , (err) ->
      cb err

  socket.on 'stop', (cb) ->
    console.log 'stop'
    models.player.stop().then ->
      getStatus cb
    , (err) ->
      console.error err
      cb 'Failed to stop.'

  socket.on 'pause', (cb) ->
    console.log 'pause'
    models.player.pause().then ->
      getStatus cb
    , (err) ->
      console.error err
      cb 'Failed to pause.'

  socket.on 'play', (cb) ->
    console.log 'play'
    models.player.pause()
    models.player.play().then ->
      getStatus cb
    , (err) ->
      console.error err
      cb 'Failed to play.'

  socket.on 'playContext', (params, cb) ->
    console.log 'playContext', params
    {uri, index, ms, duration} = params
    models.player.pause()
    models.player.playContext(models.Context.fromURI(uri), index, parseFloat(ms), parseFloat(duration)).then ->
      getStatus cb
    , (err) ->
      console.error err
      cb 'Failed to play ' + uri

  socket.on 'playTrack', (params, cb) ->
    console.log 'playTrack', params
    {uri, ms, duration} = params
    models.player.pause()
    models.player.playTrack(models.Track.fromURI(uri), parseFloat(ms), parseFloat(duration)).then ->
      getStatus cb
    , (err) ->
      console.error err
      cb 'Failed to play ' + uri

  socket.on 'sync', (cb) ->
    console.log 'sync'
    getStatus cb

  socket.on 'seek', (params, cb) ->
    console.log 'seek', params
    {amount} = params
    models.player.load('volume', 'playing', 'position', 'duration', 'track').then (player) ->
      player.seek(player.duration * parseFloat(amount))
    .then (player) ->
      cb null, {
        duration: player.duration
        position: player.position        
      }
    , (err) ->
      console.error err
      cb 'Failed to seek to ' + amount

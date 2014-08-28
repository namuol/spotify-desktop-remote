require ['$api/models'], (models) ->
  window.models = models

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
  
  socket = io.connect 'http://localhost:3001'

  socket.on 'connect', ->
    socket.emit '__player_connected__'
    status = document.getElementById 'status'
    status.className = status.innerHTML = 'connected'

  socket.on 'disconnect', ->
    status = document.getElementById 'status'
    status.className = status.innerHTML = 'disconnected'

  socket.on 'volume', (volume, cb) ->
    console.log 'volume', volume
    models.player.load('volume').then (player) ->
      volume ?= player.volume
      models.player.setVolume(parseFloat(volume).clamp(0,1))
    .then (player) ->
      cb null, currentStatus
    , (err) ->
      cb err

  socket.on 'stop', (cb) ->
    console.log 'stop'
    models.player.stop().then ->
      cb null, currentStatus
    , (err) ->
      console.error err
      cb 'Failed to stop.'

  socket.on 'pause', (cb) ->
    console.log 'pause'
    models.player.pause().then ->
      cb null, currentStatus
    , (err) ->
      console.error err
      cb 'Failed to pause.'

  socket.on 'play', (cb) ->
    console.log 'play'
    models.player.pause()
    models.player.play().then ->
      cb null, currentStatus
    , (err) ->
      console.error err
      cb 'Failed to play.'

  socket.on 'nextTrack', (cb) ->
    console.log 'nextTrack'
    models.player.skipToNextTrack().then ->
      cb null, currentStatus
    , (err) ->
      console.error err
      cb 'Failed to skip to next track.'

  socket.on 'prevTrack', (cb) ->
    console.log 'prevTrack'
    models.player.skipToPrevTrack().then ->
      cb null, currentStatus
    , (err) ->
      console.error err
      cb 'Failed to skip to prev track.'

  socket.on 'playContext', (params, cb) ->
    console.log 'playContext', params
    {uri, index, ms, duration} = params
    models.player.pause()
    models.player.playContext(models.Context.fromURI(uri), index, parseFloat(ms), parseFloat(duration)).then ->
      cb null, currentStatus
    , (err) ->
      console.error err
      cb 'Failed to play ' + uri

  socket.on 'playTrack', (params, cb) ->
    console.log 'playTrack', params
    {uri, ms, duration} = params
    models.player.pause()
    models.player.playTrack(models.Track.fromURI(uri), parseFloat(ms), parseFloat(duration)).then ->
      cb null, currentStatus
    , (err) ->
      console.error err
      cb 'Failed to play ' + uri

  socket.on 'sync', (cb) ->
    console.log 'sync'
    cb null, currentStatus

  socket.on 'seek', (amount, cb) ->
    console.log 'seek', amount
    models.player.load('volume', 'playing', 'position', 'duration', 'track').then (player) ->
      player.seek(player.duration * parseFloat(amount))
    .then (player) ->
      cb null, currentStatus
    , (err) ->
      console.error err
      cb 'Failed to seek to ' + amount

  currentStatus = null
  models.player.addEventListener 'change', (event) ->
    currentStatus = event.data
    socket.emit 'player.change', currentStatus

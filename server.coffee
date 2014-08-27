express = require 'express'
app = express()
server = require('http').createServer app
io = require('socket.io').listen server

allowCrossDomain = (req, res, next) ->
  res.header "Access-Control-Allow-Origin", '*'
  res.header "Access-Control-Allow-Methods", "GET,PUT,POST,DELETE"
  res.header "Access-Control-Allow-Headers", "Content-Type"
  next()
  return
  
app.use allowCrossDomain
app.use require('serve-static')(__dirname)

getParams = (req) ->
  result = {}
  for own k,v of req.params
    result[k] = v
  return result

io.on 'connection', (spotify_socket) ->
  spotify_socket.on 'player.change', (data) ->
    console.log 'CHANGE!'
    spotify_socket.broadcast.emit 'player.change', data
  
  io.on 'connection', (socket) ->
    socket.on 'pause', -> spotify_socket.emit 'pause'
    socket.on 'stop', -> spotify_socket.emit 'stop'
    socket.on 'nextTrack', -> spotify_socket.emit 'nextTrack'
    socket.on 'prevTrack', -> spotify_socket.emit 'prevTrack'

    socket.on 'volume', (level) -> spotify_socket.emit 'volume', level
    socket.on 'seek', (amount) -> spotify_socket.emit 'seek', amount
    
    socket.on 'play', (params) ->
      if /^spotify:track:[^:]+$/.test params?.uri
        spotify_socket.emit 'playTrack', params
      else if /^spotify:(user:[^:]+:playlist|album):[^:]+$/.test params?.uri
        spotify_socket.emit 'playContext', params
      else
        spotify_socket.emit 'play'

  app.get '/volume/:volume', (req, res, next) ->
    spotify_socket.emit 'volume', getParams(req).volume, (err, data={}) ->
      return res.send 500, err  if err
      res.send data

  app.get '/stop', (req, res, next) ->
    spotify_socket.emit 'stop', (err, data={}) ->
      return res.send 500, err  if err
      res.send data

  app.get '/pause', (req, res, next) ->
    spotify_socket.emit 'pause', (err, data={}) ->
      return res.send 500, err  if err
      res.send data

  app.get '/play', (req, res, next) ->
    spotify_socket.emit 'play', (err, data={}) ->
      return res.send 500, err  if err
      res.send data

  app.get '/nextTrack', (req, res, next) ->
    spotify_socket.emit 'nextTrack', (err, data={}) ->
      return res.send 500, err  if err
      res.send data

  app.get '/prevTrack', (req, res, next) ->
    spotify_socket.emit 'prevTrack', (err, data={}) ->
      return res.send 500, err  if err
      res.send data

  app.get /^\/play\/(spotify:track:[^:]+)(\/([0-9]+))?(\/([0-9]+))?/, (req, res, next) ->
    params =
      uri: req.params[0]
      ms: req.params[2]
      duration: req.params[4]

    spotify_socket.emit 'playTrack', params, (err, data={}) ->
      return res.send 500, err  if err
      res.send data

  app.get /^\/play\/(spotify:(user:[^:]+:playlist|album):[^:]+)(\/([0-9]+))?(\/([0-9]+))?(\/([0-9]+))?/, (req, res, next) ->
    params =
      uri: req.params[0]
      index: req.params[4]
      ms: req.params[6]
      duration: req.params[8]
    spotify_socket.emit 'playContext', params, (err, data={}) ->
      return res.send 500, err  if err
      res.send data

  app.get '/sync', (req, res, next) ->
    spotify_socket.emit 'sync', (err, data={}) ->
      return res.send 500, err  if err
      res.send data

  app.get '/seek/:amount', (req, res, next) ->
    spotify_socket.emit 'seek', getParams(req).amount, (err, data={}) ->
      return res.send 500, err  if err
      res.send data

server.listen process.env.PORT ? 3001

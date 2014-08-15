express = require 'express'
app = express()
server = require('http').createServer app
io = require('socket.io').listen server

app.use require('serve-static')(__dirname)

main_socket = null

getParams = (req) ->
  result = {}
  for own k,v of req.params
    result[k] = v
  return result

io.sockets.on 'connection', (socket) ->
  main_socket = socket

app.get '/volume/:volume', (req, res, next) ->
  main_socket.emit 'volume', getParams(req), (err, data={}) ->
    return res.send 500, err  if err
    res.send data

app.get '/stop', (req, res, next) ->
  main_socket.emit 'stop', (err, data={}) ->
    return res.send 500, err  if err
    res.send data

app.get '/pause', (req, res, next) ->
  main_socket.emit 'pause', (err, data={}) ->
    return res.send 500, err  if err
    res.send data

app.get '/play', (req, res, next) ->
  main_socket.emit 'play', (err, data={}) ->
    return res.send 500, err  if err
    res.send data

app.get /^\/play\/(spotify:track:[a-zA-Z0-9]+)(\/([0-9]+))?(\/([0-9]+))?/, (req, res, next) ->
  params =
    uri: req.params[0]
    ms: req.params[2]
    duration: req.params[4]

  main_socket.emit 'playTrack', params, (err, data={}) ->
    return res.send 500, err  if err
    res.send data

app.get /^\/play\/(spotify:(user:[a-zA-Z0-9]+:playlist|album):[a-zA-Z0-9]+)(\/([0-9]+))?(\/([0-9]+))?(\/([0-9]+))?/, (req, res, next) ->
  params =
    uri: req.params[0]
    index: req.params[4]
    ms: req.params[6]
    duration: req.params[8]
  main_socket.emit 'playContext', params, (err, data={}) ->
    return res.send 500, err  if err
    res.send data

app.get '/sync', (req, res, next) ->
  main_socket.emit 'sync', (err, data={}) ->
    return res.send 500, err  if err
    res.send data

app.get '/seek/:amount', (req, res, next) ->
  main_socket.emit 'seek', getParams(req), (err, data={}) ->
    return res.send 500, err  if err
    res.send data    

server.listen process.env.PORT ? 3001

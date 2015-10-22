# No Longer Supported

Spotify no longer officially supports Desktop Apps, so this probably wont work for you.

If you can think of an alternative way to control Spotify Desktop with a similar interface, please [let me know](https://github.com/namuol/spotify-desktop-remote/issues)!

Some possible alternatives:

- [nutgaard/SpotifyHttpJs](https://github.com/nutgaard/SpotifyHttpJs)
- [cgbystrom/spotify-local-http-api](https://github.com/cgbystrom/spotify-local-http-api)
  + [Great article about Spotify's built-in HTTP server](http://cgbystrom.com/articles/deconstructing-spotifys-builtin-http-server/)

----

# Spotify Desktop Remote

Control your Spotify Desktop app from a simple HTTP interface or with [Socket.IO](http://socket.io).

```bash
# Play a track:
curl http://localhost:3001/play/spotify:track:0FutrWIUM5Mg3434asiwkp

# Seek to the halfway mark of the song:
curl http://localhost:3001/seek/0.5

# Set the player volume:
curl http://localhost:3001/volume/0.8

# Play a playlist:
curl http://localhost:3001/play/spotify:album:2YJFLMyzzZ2k4mhfPSiOj2

# Pause the player:
curl http://localhost:3001/pause

# Stop the player:
curl http://localhost:3001/stop
```

```js
// Keep everything in sync:
socket.on('player.change', function (playerStatus) {
  console.log('The current player status is', playerStatus);
});

// Play a track:
socket.emit('play', {uri: 'spotify:track:0FutrWIUM5Mg3434asiwkp'});

// Seek to the halfway mark of the song:
socket.emit('seek', 0.5);

// Set the player volume:
socket.emit('volume', 0.8);

// Play a playlist:
socket.emit('play', {uri: 'spotify:album:2YJFLMyzzZ2k4mhfPSiOj2'});

// Pause the player:
socket.emit('pause');

// Stop the player:
socket.emit('stop');
```

See the [API reference](#api) for more details.

## Requirements

- [node.js](http://nodejs.org) >= 0.10
- A premium Spotify account, [registered as a developer](https://devaccount.spotify.com/my-account/).

## Installation

There are two parts to the app:

1. The HTTP Server that forwards commands to Spotify (`src/server.coffee`)
2. The Spotify Webapp (runs inside Spotify Desktop) that accepts commands from the server via Websockets (`src/main.coffee` and `index.html`)

```bash
# OS X/Linux users:
cd ~/Spotify

# Windows users:
# cd ~/My\ Documents/Spotify

git clone https://github.com/namuol/spotify-desktop-remote.git
cd spotify-desktop-remote

# Start the server on port 3001:
npm start

# Or run it on a different port:
# PORT=3002 npm start

# Finally, run spotify and open the app:
spotify -uri spotify:app:spotify-desktop-remote

# NOTE: You can also run the app by entering
# "spotify:app:spotify-desktop-remote" into Spotify's search bar.

# Now you can control the Spotify Desktop app by hitting the server:
curl http://localhost:3001/play/spotify:track:0FutrWIUM5Mg3434asiwkp
curl http://localhost:3001/volume/1
```

## API

### Responses

All GET operations and the [`player.change`](#player.change) socket event return a JSON object representing the current status of the player:

```js
{
  loading: false,
  playing: true,
  position: 19450,
  duration: 212400,
  index: 0,
  repeat: false,
  shuffle: false,
  volume: 0.849988579750061,
  context: null,
  contexts: [{
    index: 0,
    descriptor: {
      type: "set"
    }
  }],
  track: {
    artists: [{
      name: "Rick Astley",
      uri: "spotify:artist:0gxyHStUsqpMadRV0Di1Qt"
    }],
    disc: 1,
    duration: 212000,
    image: "spotify:image:938dfdd57d4fe8a864f6148ffb9676395d012720",
    images: [
      [
        64,
        "spotify:image:9b87c26f500947d28838ebb2e33c120f6b9a6b1b"
      ],
      [
        300,
        "spotify:image:938dfdd57d4fe8a864f6148ffb9676395d012720"
      ],
      [
        600,
        "spotify:image:d6e92c8891f16c1126c6d58f47da81873a17e993"
      ]
    ],
    name: "Never Gonna Give You Up",
    number: 1,
    playable: true,
    popularity: 65,
    starred: false,
    explicit: false,
    availability: "premium",
    album: {
      uri: "spotify:album:3vGtqTr5he9uQfusQWJ0oC"
    },
    local: false,
    advertisement: false,
    placeholder: false,
    uri: "spotify:track:0FutrWIUM5Mg3434asiwkp"
  }
}
```

### Socket.io

In order to use socket.io, include the following in your `<head>`:

```html
<script type='application/javascript' src="http://localhost:3001/socket.io/socket.io.js"></script>
```

Then somewhere after that you can connect:

```js
var socket = io.connect();
socket.on('player.change', function (playerStatus) {
  console.log('The current player status is', playerStatus);
});
```

<a name='player.change'></a>
#### `socket.on('player.change', callback(playerStatus))`
*socket only*

Subscribe to this event to be notified whenever anything about the player changes.

To poll for the status (with sockets or `GET`), see [`sync`](#sync).

```js
socket.on('player.change', function (playerStatus) {
  console.log('The current volume level is', playerStatus.volume)
});
```

Parameters:
> **`callback(playerStatus)`** *socket only*
> A callback function that accepts a single argument as the [player's current status](#responses).

#### `/sync`
#### `socket.emit('sync', callback(playerStatus))`
Perform no action; simply used to retrieve the current status of the player.

```bash
curl http://localhost:3001/sync
```

```js
socket.emit('sync', function (playerStatus) {
  console.log('The current volume level is', playerStatus.volume);
});
```

Parameters:
> **`callback(playerStatus)`** *socket only*
> A callback function that accepts a single argument as the [player's current status](#responses).

#### `/play`
#### `socket.emit('play')`
Play the current track.

```bash
curl http://localhost:3001/play
```

```js
socket.emit('play');
```

#### `/play/:track_uri/:ms?/:duration?`
#### `socket.emit('play', {uri[, ms, duration]})`
Play a specific track with a given URI.

```bash
curl http://localhost:3001/play/spotify:track:0FutrWIUM5Mg3434asiwkp

# Play the first 30 seconds:
curl http://localhost:3001/play/spotify:track:0FutrWIUM5Mg3434asiwkp/0/30000

# Play the first 30 seconds starting one minute into the song:
curl http://localhost:3001/play/spotify:track:0FutrWIUM5Mg3434asiwkp/60000/30000
```

```js
socket.emit('play', {uri: 'spotify:track:0FutrWIUM5Mg3434asiwkp'});

// Play the first 30 seconds:
socket.emit('play', {
  uri: 'spotify:track:0FutrWIUM5Mg3434asiwkp',
  ms: 0,
  duration: 30000
});

// Play the first 30 seconds starting one minute into the song:
socket.emit('play', {
  uri: 'spotify:track:0FutrWIUM5Mg3434asiwkp',
  ms: 60000,
  duration: 30000
});
```

Parameters:
> **`track_uri`** / **`uri`**
> A spotify track URI.
>
> Example: `spotify:track:0FutrWIUM5Mg3434asiwkp`

> **`ms`** *optional*
> Number of milliseconds to begin playing the track at.

> **`duration`** *optional*
> Number of milliseconds to play the song for before stopping. 

#### `/play/:playlist_uri/:index?/:ms?/:duration?`
#### `socket.emit('play', {uri[, index, ms, duration]})`
Play a specific album or user playlist with a given URI.

```bash
curl http://localhost:3001/play/spotify:album:2YJFLMyzzZ2k4mhfPSiOj2
curl http://localhost:3001/play/spotify:user:spotify:playlist:4BKT5olNFqLB1FAa8OtC8k

# Start at the third track in the playlist:
curl http://localhost:3001/play/spotify:user:spotify:playlist:4BKT5olNFqLB1FAa8OtC8k/3

# Start a minute into the third track in the playlist:
curl http://localhost:3001/play/spotify:user:spotify:playlist:4BKT5olNFqLB1FAa8OtC8k/3/60000

# Start a minute into the third track in the playlist and play the first 30 seconds:
curl http://localhost:3001/play/spotify:user:spotify:playlist:4BKT5olNFqLB1FAa8OtC8k/3/60000/30000
```

```js
socket.emit('play', {uri: 'spotify:album:2YJFLMyzzZ2k4mhfPSiOj2'});
socket.emit('play', {uri: 'spotify:user:spotify:playlist:4BKT5olNFqLB1FAa8OtC8'});

// Start at the third track in the playlist:
socket.emit('play', {
  uri: 'spotify:user:spotify:playlist:4BKT5olNFqLB1FAa8OtC8k',
  index: 3
});

// Start a minute into the third track in the playlist:
socket.emit('play', {
  uri: 'spotify:user:spotify:playlist:4BKT5olNFqLB1FAa8OtC8k',
  index: 3,
  ms: 60000
});

// Start a minute into the third track in the playlist and play the first 30 seconds:
socket.emit('play', {
  uri: 'spotify:user:spotify:playlist:4BKT5olNFqLB1FAa8OtC8k',
  index: 3,
  ms: 60000,
  duration: 30000
});
```

Parameters:
> **`playlist_uri`** / **`uri`**
> A spotify playlist URI (an album or user playlist).
>
> Example: `spotify:album:2YJFLMyzzZ2k4mhfPSiOj2`
>
> Example: `spotify:user:spotify:playlist:4BKT5olNFqLB1FAa8OtC8k`

> **`index`** *optional*
> The track number to play (starting at zero).

> **`ms`** *optional*
> Number of milliseconds to begin playing the track at.

> **`duration`** *optional*
> Number of milliseconds to play the song for before stopping. 

#### `/pause`
#### `socket.emit('pause')`
Pause the player.

```bash
curl http://localhost:3001/pause
```

```js
socket.emit('pause');
```

#### `/stop`
#### `socket.emit('stop')`
Stop the player.

```bash
curl http://localhost:3001/stop
```

```js
socket.emit('pause');
```

#### `/volume/:volume`
#### `socket.emit('volume', volume)`
Set the player volume level.

```bash
curl http://localhost:3001/volume/1
curl http://localhost:3001/volume/0
curl http://localhost:3001/volume/0.5
```

```js
socket.emit('volume', 1);
socket.emit('volume', 0);
socket.emit('volume', 0.5);
```

Parameters:
> **`volume`**
> A number representing the volume level, between 0 and 1.

#### `/seek/:amount`
#### `socket.emit('seek', amount)`
Set the playhead's position.

```bash
curl http://localhost:3001/seek/0
curl http://localhost:3001/seek/0.5
```

```js
socket.emit('seek', 0);
socket.emit('seek', 0.5);
```


Parameters:
> **`amount`**
> A number representing the position of the seek bar, between 0 and 1.

## License

MIT

----

[![Analytics](https://ga-beacon.appspot.com/UA-33247419-2/spotify-desktop-remote/README.md)](https://github.com/igrigorik/ga-beacon)

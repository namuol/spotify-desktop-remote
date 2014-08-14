# Spotify Desktop Remote

Control your Spotify Desktop app from a simple HTTP interface.

## Requirements

- [node.js](http://nodejs.org) >= 0.10
- A premium Spotify account and to [register as a developer](https://devaccount.spotify.com/my-account/).

## Installation

There are two parts to the app:

1. The HTTP Server that forwards commands to Spotify (`server.coffee`)
2. The Spotify Webapp that accepts commands from the server via Websockets (`src/main.coffee` and `index.html`)

```sh
# OS X/Linux users:
cd ~/Spotify

# Windows users:
# cd ~/My\ Documents/Spotify

git clone https://github.com/namuol/spotify-desktop-remote
cd spotify-desktop-remote

# Install global dependencies:
npm install -g coffee-script grunt-cli

# Install local dependencies:
npm install

# Build project files and start the server on port 3001:
grunt

# Or run it on a different port:
# PORT=3002 grunt

# Finally, run spotify and open the app:
spotify -uri spotify:app:spotify-desktop-remote

# NOTE: You can also run the app by entering
# "spotify:app:spotify-desktop-remote" into Spotify's search bar.

# Now you can control the Spotify Desktop app by hitting the server:
curl http://localhost:3001/play/spotify:track:0FutrWIUM5Mg3434asiwkp
curl http://localhost:3001/volume/1
```

## Responses

All operations return a JSON object representing the current status of the player:

```js
{
  "volume": 1, // Current volume level
  "playing": false, // Whether or not the player is playing.
  "duration": 228013, // The duration of the current track in milliseconds.
  "position": 27268, // The current position of the playhead in milliseconds.
  "track": "6GJOjvlrF2TKxq19Ey2H66", // The current track ID (spotify:track:<id>)
  "index": 0 // The number of the currently playing track in the current playlist.
}
```

## API

#### `GET /play/:track_uri/:ms?/:duration?`
```sh
curl http://localhost:3001/play/spotify:track:0FutrWIUM5Mg3434asiwkp
```

Parameters:
> `track_uri`
> A spotify track URI.
> Example: `spotify:track:0FutrWIUM5Mg3434asiwkp`

> `ms` *optional*
> Number of milliseconds to begin playing the track at.

> `duration` *optional*
> Number of milliseconds to play the song for before stopping. 

#### `GET /play/:playlist_uri/:index?/:ms?/:duration?`
```sh
curl http://localhost:3001/play/spotify:album:2YJFLMyzzZ2k4mhfPSiOj2
curl http://localhost:3001/play/spotify:user:spotify:playlist:4BKT5olNFqLB1FAa8OtC8k
```

Parameters:
> `playlist_uri`
> A spotify playlist URI (an album, user playlist, or trackset).
> Example: `spotify:album:2YJFLMyzzZ2k4mhfPSiOj2`
> Example: `spotify:user:spotify:playlist:4BKT5olNFqLB1FAa8OtC8k`

> `index` *optional*
> The track number to play (starting at zero).

> `ms` *optional*
> Number of milliseconds to begin playing the track at.

> `duration` *optional*
> Number of milliseconds to play the song for before stopping. 

#### `GET /pause`
```sh
curl http://localhost:3001/pause
```

#### `GET /stop`
```sh
curl http://localhost:3001/stop
```

#### `GET /volume/:volume`
```sh
curl http://localhost:3001/volume/1
curl http://localhost:3001/volume/0
curl http://localhost:3001/volume/0.5
```

Parameters:
> `volume`
> A number representing the volume level, between 0 and 1.

#### `GET /seek/:amount`
```sh
curl http://localhost:3001/seek/0
curl http://localhost:3001/seek/0.5
```

Parameters:
> `amount`
> A number representing the position of the seek bar, between 0 and 1.

#### `GET /sync`
curl http://localhost:3001/sync

Perform no action; simply used to retrieve the current status of the player.

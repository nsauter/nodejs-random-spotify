# nodejs-random-spotify

## What does this app?

This app connects to the spotify api and has 3 endpoints /generaterandomsong which outputs a random new song from spotify, /generatetoken which generates a token to access a song from a specific playlist and /getplaylistsong which lets you access the playlist with the generated token.

This was my first nodejs project and i finished it on the weekend to gift it to my crush since we are talking a lot about music. Feel free to pull and try it out. Its far from perfect but it works :) 

Ah, i forgot the best 'feature' -> If there is an error the api just responds and rickrolles you.

## Possible .env values

* `DATA_FILE` - holds a value like /var/tmp/tokenfile
* `APIPASS` - holds the API Password which is allowed to generate the playlist token
* `SPOTIFY_ID` - holds the Spotify api ID
* `SPOTIFY_SECRET` - holds the Spotify api secret
* `ADDRESS` - is the bind address for node
* `PORT` - is the bind port for node
* `SSL_KEY` - path to the ssl key file 
* `SSL_CERT` - path to ssl certificate file (pem) 

Make sure to set the right Spotify Playlist URL on Line 99. (GET playlist not tracks).



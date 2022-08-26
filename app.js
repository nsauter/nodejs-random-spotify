const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const Spotify = require('node-spotify-api');
const fs = require('fs');
const jfile = require('jfile');
const https = require('https'); // https obviously
const path = require('path'); // deliver html file
const router = express.Router(); // express router for sending to different html page -----> maybe useless lets check

require('dotenv').config(); // .env Config mgmt

//Start App
const app = express();

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'", 'fonts.googleapis.com', "'unsafe-inline'", 'i.scdn.co', 'sndcdn.com', "open.spotify.com"],
			scriptSrc: ["'self'", "'unsafe-inline'"],
			fontSrc:["'self'",'fonts.googleapis.com', '*'],
		},
	})
);
app.use(morgan('tiny'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'webcontent/static'))); // staic content
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "webcontent"));
app.use(express.json()); // json response for express
//app.use(express.static('./public'));
app.use(express.urlencoded({
    extended: true
}));

// Functions
function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
};


app.get('/', function(req, res) {
    res.render('index');
});

app.get('/legal', function(req, res) {
    res.render('legal');
});

// Get random Song
app.get('/random', async (req, res) => {
    // Authenticate to spotify api
    const spotify = new Spotify({
        id: process.env.SPOTIFY_ID,
        secret: process.env.SPOTIFY_SECRET
    });

    // 'Calculating' Offset
    const offset = between(1, 80);

    // Make the actual request
    spotify
        .request(`https://api.spotify.com/v1/browse/new-releases?offset=${offset}&limit=1`)
        .then(function(data) {
            // Get the Artists
            const artist = (data['albums']['items'][0]['artists'][0]['name']);
            // Get Song Name
            const song = (data['albums']['items'][0]['name']);
            // Get Cover
            const cover = (data['albums']['items'][0]['images'][0]['url']);
            //Get Spotify Link to Song
            const link = (data['albums']['items'][0]['external_urls']['spotify']);
            
            // Respond with the song & html template
            console.log('Sending JSON Data with random Song to ' + req.connection.remoteAddress);
	    res.render("random", { state: "Success", artist: artist, name: song, cover: cover, link: link});
    }) .catch(function(err) {
            // Respond with the song
            console.log('An error occured. Sending Rick Astleys.');
            res.render("random", { state: 'An error occured.', artist: 'Rick Astley', name: 'Never Gonna Give You Up', cover: 'https://i1.sndcdn.com/artworks-000196755418-x4u4ma-t500x500.jpg', link: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=3NS86FG7SNCCY66yY3QD-g'}),
            console.log('Error occured: ' + err);
    });
});

const address = process.env.ADDRESS || '0.0.0.0';
const port = process.env.PORT || 1337;

https.createServer({
    key: fs.readFileSync(`${process.env.SSL_KEY}`),
    cert: fs.readFileSync(`${process.env.SSL_CERT}`)
}, app)
.listen(port, address, () => {
    console.log(`Listening at http://${address}:${port}`);
});

/*app.listen(port, address, () => {
    console.log(`Listening at http://${address}:${port}`);
});*/

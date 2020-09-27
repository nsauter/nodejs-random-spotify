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
const https = require('https');

require('dotenv').config();

//Start App
const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
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

// Generate Token
app.post('/generatetoken', async (req, res) => {
    console.log(req.body);
    const { pass } = req.body;
    if (!pass) {
        console.log(`API Token is needed but was not sent`);
        res.json({
            message: 'You need to provide a API password!'
        });        
    } else {
        let apipass = bcrypt.hashSync(process.env.APIPASS, 10);
        if (bcrypt.compareSync(pass, apipass)) {
            console.log('API Password was accepted. Generating Token');
            const token = nanoid(8);
            
            // Write Token to File
            await fs.writeFile(process.env.DATA_FILE, token, function (err){
                if (err) return console.log(err);
                console.log('Wrote Token to file');
            });

            // Send User the token
            res.json({
                message: token
            });
        } else {
            console.log('API Password was not accepted.')
            res.json({
                message: 'Wrong Password provided.'
            });
        }
    }
});

// Get random song of pmm playlist
app.post('/getplaylistsong', async (req, res) => {
    console.log(req.body);
    const { token } = req.body;
    if (!token) {
        console.log(`API Token is needed but was not sent`);
        res.json({
            message: 'Error. Token is needed for this action.'
        });        
    } else {
        fs.readFile(process.env.DATA_FILE, function (err, data) {
            if (err) throw err;
            if(data.includes(token)){
                console.log('Token was found in file.');
                try {
                    fs.unlinkSync(process.env.DATA_FILE);
                    console.log('Successfully deleted Token File.');
                } catch(err) {
                    console.log('Could not delete Token File. Error is: ' + err);
                }
                
                // MAKE SPOFIFY API STUFF

                // Authenticate to spotify api
                const spotify = new Spotify({
                    id: process.env.SPOTIFY_ID,
                    secret: process.env.SPOTIFY_SECRET
                });

                // Make the actual request
                spotify
                    .request(`https://api.spotify.com/v1/playlists/${process.env.SPOFIFY_PLAYLIST_ID}/tracks`)
                    .then(function(data) {
                        const playlist_size = (data['tracks']['total']);
                        data = (data['tracks']['items'][between(0, playlist_size)]);
                                                
                        // Get the Artists
                        const artist = (data['track']['album']['artists'][0]['name']);
                        // Get Song Name
                        const song = (data['track']['album']['name']);
                        // Get Cover
                        const cover = (data['track']['album']['images'][0]['url']);
                        //Get Spotify Link to Song
                        const link = (data['track']['album']['external_urls']['spotify']);
                        
                        // Respond with the song
                        console.log('Sending JSON Data with random Song vom PMM Playlist');
                        res.json({
                            Status: 'Success',
                            Künstler: artist,
                            Name: song,
                            Cover: cover,
                            Link: link
                        });
                }) .catch(function(err) {
                        // Respond with Rick Astley because of caught error
                        console.log('An error occured. Sending Rick Astley.');
                        res.json({
                            Status: 'An error occured.',
                            Künstler: 'Rick Astley',
                            Name: 'Never Gonna Give You Up',
                            Cover: 'https://i1.sndcdn.com/artworks-000196755418-x4u4ma-t500x500.jpg',
                            Link: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=3NS86FG7SNCCY66yY3QD-g'
                        });
                        console.log('Error occured: ' + err);
                });

                //Finished PMM Playlist bashing

            } else {
                console.log('Wrong Token was privided. Resonding with Rick Astley');

                // Respond with the song
                console.log('An error occured. Sending Rick Astleys.');
                res.json({
                    Status: 'An error occured.',
                    Künstler: 'Rick Astley',
                    Name: 'Never Gonna Give You Up',
                    Cover: 'https://i1.sndcdn.com/artworks-000196755418-x4u4ma-t500x500.jpg',
                    Link: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=3NS86FG7SNCCY66yY3QD-g'
                });
            };
        });
    } 
});



// Get random Song
app.get('/getrandomsong', async (req, res) => {
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
            
            // Respond with the song
            console.log('Sending JSON Data with random Song to ' + req.connection.remoteAddress);
            res.json({
                Status: 'Success',
                Künstler: artist,
                Name: song,
                Cover: cover,
                Link: link
            });
    }) .catch(function(err) {
            // Respond with the song
            console.log('An error occured. Sending Rick Astleys.');
            res.json({
                Status: 'An error occured.',
                Künstler: 'Rick Astley',
                Name: 'Never Gonna Give You Up',
                Cover: 'https://i1.sndcdn.com/artworks-000196755418-x4u4ma-t500x500.jpg',
                Link: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=3NS86FG7SNCCY66yY3QD-g'
            });
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
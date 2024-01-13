const express = require('express');
const app = express();
const path = require('path');





let topMovies = [
    {
        title: 'Surf\'s Up',
        director: 'Ash Brannon'
    },

    {
        title: 'Cool Runnings',
        director: 'Jon Turteltaub'
    },

    {
        title: 'Inglorious Basterds',
        director: 'Quentin Tarantino'
    },

    {
        title: 'Good Will Hunting',
        director: 'Gus Van Sant'
    },

    {
        title: 'White Men Can\'t Jump',
        director: 'Ron Shelton'
    },

    {
        title: 'Semi-pro',
        director: 'Kent Alterman'
    },

    {
        title: 'The Tuskegee Airmen',
        director: 'Robert Markowitz'
    },

    {
        title: 'Inception',
        director: 'Christopher Nolan'
    },

    {
        title: 'The Big Short',
        director: 'Adam Mckay'
    },

    {
        title: 'Warrior',
        director: 'Gavin O\'Connor'
    },
]


app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.send('Welcome to my movie list!')
});
app.get('/movies', (req, res) => {
    res.json(topMovies)
});



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.')
})
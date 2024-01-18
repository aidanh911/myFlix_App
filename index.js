const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const mongoose = require('mongoose');
const morgan = require('morgan')


const models=require('./models.js');

const Movies = models.Movie;
const User = models.User;


mongoose.connect('mongodb://127.0.0.1:27017/[MyFlixDB]', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});


app.use(morgan('dev'))

app.use(bodyParser.json());

// let users = [
//     {
//         id: 1,
//         name: "John",
//         favoriteMovies: []
//     },
//
//     {
//         id: 2,
//         name: "Keegan",
//         favoriteMovies: ["The Conjuring"],
//     }
// ]


// let movies = [
//     {
//         Title: "Surf\"s Up",
//         Description: "The reality/documentary follows Cody Maverick, a teenage Royal Penguin, and his friend Chicken Joe, as Cody leaves his hometown of Shiverpool, Antarctica, to participate in \"Big Z Memorial Surf Off\" competition commemorating deceased surfing star Big Z on Pen Gu Island.",
//         Genre: {
//             Name: "Animation",
//             Description: "Animation is a filmmaking technique by which still images are manipulated to create moving images. In traditional animation, images are drawn or painted by hand on transparent celluloid sheets to be photographed and exhibited on film"
//         },
//         Director: {
//             Name: "Ash Brannon"
//         },
//         imageURL: "https://m.media-amazon.com/images/M/MV5BMjE4NDE3NzcwM15BMl5BanBnXkFtZTcwMTI0ODYzMw@@._V1_.jpg"
//     },
//
//     {
//         Title: "Cool Runnings",
//         Description: "When a Jamaican sprinter is disqualified from the Olympic Games, he enlists the help of a dishonored coach to start the first Jamaican Bobsled Team. When a Jamaican sprinter is disqualified from the Olympic Games, he enlists the help of a dishonored coach to start the first Jamaican Bobsled Team",
//         Genre: {
//             Name: "Comedy",
//             Description: "Comedy is a genre of fiction that consists of discourses or works intended to be humorous or amusing by inducing laughter, especially in theatre, film, stand-up comedy, television, radio, books, or any other entertainment medium"
//         },
//         Director: {
//             Name: "Jon Turteltaub",
//         }
//     },
//
//     {
//         Title: "Inglorious Basterds",
//         Director: "Quentin Tarantino"
//     },
//
//     {
//         Title: "Good Will Hunting",
//         Director: "Gus Van Sant"
//     },
//
//     {
//         Title: "White Men Can\"t Jump",
//         Director: "Ron Shelton"
//     },
//
//     {
//         Title: "Semi-pro",
//         Director: "Kent Alterman"
//     },
//
//     {
//         Title: "The Tuskegee Airmen",
//         Director: "Robert Markowitz"
//     },
//
//     {
//         Title: "Inception",
//         Director: "Christopher Nolan"
//     },
//
//     {
//         Title: "The Big Short",
//         Director: "Adam Mckay"
//     },
//
//     {
//         Title: "Warrior",
//         Director: "Gavin O\"Connor"
//     },
// ]

/* express.static not working, updated versions, dependencies, tried using path.join, the only way it works if i use .get

these don"t work, I have modified them in small ways to try and specify the file path better but they dont work

app.use(express.static(__dirname + "./public"));
I have tried adding and removing the ./ before public in every combination.

I also tried adding a script tag to the html
<script src="./index.js"></script>


app.use("/documentation.html", express.static("public"))

 */

//UPDATE username for selected user
app.put('/users/:username', async (req, res) => {
    try {
        console.log('Updating user:', req.params.username);
        console.log('Request body:', req.body);

        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username },
            {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    username: req.body.username,
                    password: req.body.password,
                    birthday: req.body.birthday,
                }
            },
            { new: true }
        );

        console.log('Updated user:', updatedUser);
        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
    }
});

// CREATE new user in the users array

app.post("/users", async (req, res) => {
    try {
        const newUser = {
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            favoriteMovies: [],
            birthday: req.body.birthday,
        };

        const user = await User.create(newUser);
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

//CREATE new movie in the specified users favorite movie list
app.post('/users/:name/movies/:_id', async (req, res) => {
    try {
        console.log('Adding movie', req.params._id);

        const updatedUser = await User.findOneAndUpdate(
            { name: req.params.name },
            { $push: { favoriteMovies: req.params._id } },
            { new: true }
        );

        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

//DELETE movie from users favorite movie array

app.delete ('/users/:id/:movieID', async (req, res) => {
    try {
        console.log('Deleting movie from user\'s favorites by id', req.params.movieID, 'for user id', req.params.id);

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.id },
            { $pull: { favoriteMovies: req.params.movieID } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        res.json(updatedUser.favoriteMovies);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});



//DELETE user by id
app.delete('/users/:id', async (req, res) => {
    try {
        console.log('Deleting user with ID', req.params.id);

        const deletedUser = await User.findOneAndDelete(
            { _id: req.params.id }
        );

        if (!deletedUser) {
            return res.status(404).send('User not found');
        }

        const updatedUsers = await User.find();

        res.json(updatedUsers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});


//READ documentation file
app.get("/documentation", (req, res) => {
    res.sendFile(path.join(__dirname, "public/documentation.html"));
});



//READ welcome page
app.get("/", (req, res) => {
    res.send("Welcome to my movie list!")
});

//READ my favorite movies array
app.get("/movies", async (req, res) => {
    try {
        const movies = await Movies.find();
        console.log('Movies found:', movies);
        res.status(200).json(movies);
    } catch (err) {
        console.error('Error during Movies.find():', err);
        res.status(500).send("Error: " + err);
    }
});

// READ users array
app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        console.log('Movies found:', users);
        res.status(200).json(users);
    } catch (err) {
        console.error('Error during users.find():', err);
        res.status(500).send("Error: " + err);
    }
});


//READ movie info selected by title from favorite movie array
app.get("/movies/:title", async (req, res) => {
    try {
        const movie = await Movies.findOne({ title: req.params.title });
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).send('Movie not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

//READ genre info based on requested genre from favorite movie array
app.get("/movies/genre/:genreName", async (req, res) => {
    try {
        const movies = await Movies.find({'genre.name': req.params.genreName});
        if (movies.length > 0) {
            const genreInfo = movies[0].genre;
            res.json(genreInfo);
        } else {
            res.status(404).send('Genre not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err)
    }
});

//READ director info based on requested director from favorite movie array

app.get("/movies/director/:directorName", async (req, res) => {
    try {
        const movies = await Movies.find({'director.name': req.params.directorName});
        if (movies.length > 0) {
            const directorInfo = movies[0].director;
            res.json(directorInfo);
        } else {
            res.status(404).send('Genre not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err)
    }
});
// app.get("/movies/Director/:directorName", (req, res) => {
//     const {directorName} = req.params;
//     const director = movies.find(movie => movie.Director.Name === directorName).Director;
//
//     if (director) {
//         res.status(200).json(director)
//     } else {
//         res.status(400).send("no such Director")
//     }
// });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something Broke!");
});

app.listen(8080, () => {
    console.log("Your app is listening on port 8080.")
})



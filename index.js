const express = require("express");
const app = express();
const path = require("path");
const body_Parser = require("body-parser");
const uuid = require("uuid");
const mongoose = require('mongoose');
const morgan = require('morgan')
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
const cors = require('cors');
const {check, validationResult} = require('express-validator');

const models=require('./models.js');

const Movies = models.Movie;
const Users = models.User;

mongoose.connect('mongodb+srv://aidanh911:K1testr1ng@cluster0.j7ulxmn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

// mongoose.connect('mongodb://127.0.0.1:27017/[MyFlixDB]', { useNewUrlParser: true, useUnifiedTopology: true });

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

app.use(cors())
app.use(morgan('dev'))

app.use(body_Parser.json());
app.use(body_Parser.urlencoded({ extended: true }));



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
app.put('/users/:username', passport.authenticate('jwt', { session: false }), [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
    if(req.user.username !== req.params.username) {
        return res.status(400).send('Permission denied')

    }

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        console.log('Updating user:', req.params.username);
        console.log('Request body:', req.body);

        const updatedUser = await Users.findOneAndUpdate(
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

app.post("/users", [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
], async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);

    if (hashedPassword) {
        console.log(hashedPassword);
    } else {
        console.log('Hash password not created');
    }

    await Users.findOne({ username: req.body.username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.username + ' already exists');
            } else {
                Users.create({
                    name: req.body.name,
                    email: req.body.email,
                    username: req.body.username,
                    password: hashedPassword,
                    favoriteMovies: [],
                    birthday: req.body.birthday,
                })
                    .then((user) => res.status(201).json(user))
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});


//CREATE new movie in the specified users favorite movie list
app.post('/users/:name/movies/:_id', passport.authenticate('jwt', { session: false }),async (req, res) => {
    if(req.user.name !== req.params.name) {
        return res.status(400).send('Permission denied')

    }

    try {
        console.log('Adding movie', req.params._id);

        const updatedUser = await Users.findOneAndUpdate(
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

app.delete ('/users/:name/:movieID', passport.authenticate('jwt', { session: false }),async (req, res) => {
    if(req.user.name !== req.params.name) {
        return res.status(400).send('Permission denied')

    }

    try {
        console.log('Deleting movie from user\'s favorites by id', req.params.movieID, 'for user id', req.params.name);


        const updatedUser = await Users.findOneAndUpdate(
            { name: req.params.name },
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
app.delete('/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Ensure req.user has the expected structure with an 'id' property
        if (!req.user || !req.user.id) {
            return res.status(401).send('Unauthorized');
        }

        const userIdFromToken = req.user.id;
        const userIdFromParams = req.params.id;

        if (userIdFromToken !== userIdFromParams) {
            return res.status(400).send('Permission denied');
        }

        console.log('Deleting user with ID', userIdFromParams);

        const deletedUser = await Users.findOneAndDelete(
            { _id: userIdFromParams }
        );

        if (!deletedUser) {
            return res.status(404).send('User not found');
        }

        const updatedUsers = await Users.find();

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
app.get("/users", passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const users = await Users.find();
        console.log('Movies found:', users);
        res.status(200).json(users);
    } catch (err) {
        console.error('Error during users.find():', err);
        res.status(500).send("Error: " + err);
    }
});


//READ movie info selected by title from favorite movie array
app.get("/movies/:title", passport.authenticate('jwt', { session: false }), async (req, res) => {
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
app.get("/movies/genre/:genreName", passport.authenticate('jwt', { session: false }), async (req, res) => {
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

app.get("/movies/director/:directorName", passport.authenticate('jwt', { session: false }), async (req, res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
    console.log('Listening on Port ' + port);
});



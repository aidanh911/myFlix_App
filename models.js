const mongoose = require('mongoose')

const genreSchema = mongoose.Schema({
    name: String,
    description: String
});

const directorSchema = mongoose.Schema({
    name: String,
    biography: String
});

const movieSchema = mongoose.Schema({
    title: { type: String, required: true },
    plotDescription: { type: String, required: true },
    genre: genreSchema, // Use nested schema for genre
    director: directorSchema, // Use nested schema for director
    imageUrl: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    birthday: Date,
    favoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

let Movie = mongoose.model('movies', movieSchema);
let User = mongoose.model('users', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;



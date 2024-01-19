const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;


let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
        },
        async (username, password, callback) => {
            console.log(`Trying to authenticate user: ${username}`);
            try {
                const user = await Users.findOne({ username: username });

                if (!user) {
                    console.log('User not found:', username);
                    return callback(null, false, {
                        message: 'Incorrect username or password',
                    });
                }

                console.log('User found:', user);
                console.log('finished');
                return callback(null, user);
            } catch (error) {
                console.error('Error in LocalStrategy:', error);
                return callback(error);
            }
        }
    )
);



passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, async (jwtPayload, callback) => {
    console.log('Received JWT Payload:', jwtPayload);

    try {
        const username = jwtPayload.user.username;
        console.log(username)

        const user = await Users.findOne({ username });

        console.log('Found user:', user);

        if (!user) {
            return callback(null, false, { message: 'User not found' });
        }

        return callback(null, user);
    } catch (error) {
        console.error('Error in JWT authentication:', error);
        return callback(error);
    }
}));
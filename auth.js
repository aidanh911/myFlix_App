const jwtSecret = 'your_jwt_secret';
const jwt = require('jsonwebtoken');
const passport = require('passport');

let generateJWTToken = (user) => {
    const token = jwt.sign({ user }, jwtSecret, {
        subject: user.username.toString(),
        expiresIn: '7d',
        algorithm: 'HS256',
    });
    console.log('Generated JWT Token:', token);
    return token;
};

module.exports = (router) => {
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            console.log('Local Authentication Result:', error, user, info);

            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: null
                });
            }

            req.login(user, { session: false }, (error) => {
                if (error) {
                    return res.send(error);
                }

                const token = generateJWTToken(user);
                console.log('Generated Token:', token);

                return res.json({ user, token });
            });
        })(req, res, next);
    });
};

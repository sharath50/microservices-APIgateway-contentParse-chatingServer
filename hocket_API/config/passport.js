const jwt = require("jsonwebtoken");
const config = require("../config/database");
const User = require("../models/users");

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies['Authorization'];
    }
    return token;
};

/**
 * passport jwt starategy
 */
const JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = function(passport){
    let opts = {}
    opts.jwtFromRequest = cookieExtractor; /*ExtractJwt.fromAuthHeaderWithScheme('jwt') /*ExtractJwt.fromAuthHeaderAsBearerToken(); ExtractJwt.fromHeader('Authorization')*/
    opts.secretOrKey = config.secret;
    // opts.algorithms = ["HS256", "HS384"];
    // opts.issuer = 'accounts.examplesoft.com';
    // opts.audience = 'yoursite.net';

    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.getUserById(jwt_payload._id, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
    }));
}

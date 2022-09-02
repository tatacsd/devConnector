const jwt = require('jsonwebtoken');
const config = require('config');

// midleware has three parameters -> req, res, next
module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if(!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token if there is one
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret')); // told jwt to verify the token with the secret

        req.user = decoded.user; // set req.user to the user in the payload
        next(); // call next to move on to the next step of the middleware
    } catch(err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
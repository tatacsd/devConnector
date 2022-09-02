const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// @route   GET api/auth
// @desc    
// @access  Public
router.get('/', auth, async (req, res) => {  // add auth as second parameter to make route protected
    try{
        const user = await User.findById(req.user.id).select('-password'); // find user by id without password
        res.json(user);
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/', 
    // use express-validator to check for errors
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        // check for errors
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // destructuring req.body
        const { email, password } = req.body;

        try {
            // find user by email
            let user = await User.findOne({ email: email });
            if(!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            // compare password using bcrypt compare method
            const isMatch = await bcrypt.compare(password, user.password); // inputed password and user.password
            if(!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            // return jsonwebtoken
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (error, token) => {
                    if(error) throw error;
                    res.json({ token });
                }
            );

        } catch(error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    }
);


// export the router
module.exports = router;
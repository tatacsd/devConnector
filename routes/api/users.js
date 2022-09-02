const express = require('express');
const gravatar = require('gravatar');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// express-validator
const { check, validationResult } = require('express-validator');


// @route   GET api/users
// @desc    Register user
// @access  Public
router.post('/',[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    // check for errors
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        // return 400 status and json with errors
        return res.status(400).json({ errors: errors.array() });
    }

    // destructuring req.body
    const { name, email, password } = req.body;

   
    try {
         // See if user exists
        let user = await User.findOne({ email: email });
        if(user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }
        
        // Get users gravatar
        const avatar = gravatar.url(email, {
            s: '200', // size
            r: 'pg', // no naked people
            d: 'mm' // default image
        });

        // create new user
        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10); // 10 is recommended value

        user.password = await bcrypt.hash(password, salt);

        // save user to db
        await user.save();

        // Return jsonwebtoken
        res.send('User registered');
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
    
   
    
});

// export the router
module.exports = router;
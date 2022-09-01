const express = require('express');
const router = express.Router();

// express-validator
const { check, validationResult } = require('express-validator');


// @route   GET api/users
// @desc    Register user
// @access  Public
router.post('/',[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], (req, res) => {
    // check for errors
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        // return 400 status and json with errors
        return res.status(400).json({ errors: errors.array() });
    }
    
    res.send('User route')
    
});

// export the router
module.exports = router;
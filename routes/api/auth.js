const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

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

// export the router
module.exports = router;
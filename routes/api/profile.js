const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // find the profile by user id
        // populate the user field with name and avatar using the user model
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        // if no profile found
        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        // if profile found
        res.json(profile);

        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// export the router
module.exports = router;
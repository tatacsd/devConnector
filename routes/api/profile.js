const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

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


// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post(
    '/',
    [auth, 
        // use express-validator to check for errors
        [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        // check for errors
        const errors = validationResult(req);
        // return errors if there are any
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // destructuring req.body to get the fields
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        // Build profile object
        const profileFields = {};
        // check if user has the field and set it to the profileFields object
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername ) profileFields.githubusername = githubusername;

        // skills - split into array and remove spaces
        if(skills ) profileFields.skills = skills.split(',').map(skill => skill.trim());

        // Build social object
        profileFields.social = {};
        // check if user has the field and set it to the profileFields.social object
        if(youtube) profileFields.social.youtube = youtube;
        if(twitter) profileFields.social.twitter = twitter;
        if(facebook) profileFields.social.facebook = facebook;
        if(linkedin) profileFields.social.linkedin = linkedin;
        if(instagram) profileFields.social.instagram = instagram;

        // update or create profile
        try {
            // find profile by user id
            let profile = await Profile.findOne({ user: req.user.id }); // comes from auth middleware token

            if(profile) {
                // update profile
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id }, // find by user id
                    { $set: profileFields }, // set the profileFields object
                    { new: true } // return the new profile
                );

                return res.json(profile);
            } 

            // create profile
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        }
        catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }        
    }
);

// export the router
module.exports = router;
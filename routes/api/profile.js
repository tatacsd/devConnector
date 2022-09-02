const express = require('express');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const router = express.Router();
const auth = require('../../middleware/auth');

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

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {   
    try {
        // find all profiles and populate the user field with name and avatar using the user model
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        // find profile by user id and populate the user field with name and avatar using the user model
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        // if no profile found
        if(!profile) return res.status(400).json({ msg: 'Profile not found' });

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        // if the user id is not valid display a message
        if(error.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove users posts
        // find profile by user id and remove it
        await Profile.findOneAndRemove({ user: req.user.id });

        // find user by user id and remove it
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty()
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
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        // create newExp object
        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            // find profile by user id
            const profile = await Profile.findOne({ user: req.user.id });

            // add the newExp object to the experience array
            profile.experience.unshift(newExp); // unshift adds to the beginning of the array

            // save profile
            await profile.save();

            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    }
);



// export the router
module.exports = router;
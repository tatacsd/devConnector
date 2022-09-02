const express = require('express');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('text', 'Text is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        // check for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // get user from db using the id from the token withouth the password
            const user = await User.findById(req.user.id).select('-password');

            // create a new post
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });

            // save the post to the db
            const post = await newPost.save();

            // return the post
            res.json(post);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }       
    });


// export the router
module.exports = router;
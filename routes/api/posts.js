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
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }       
    }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get(
    '/', 
    auth, 
    async (req, res) => {
        try {
            // get all posts
            const posts = await Post.find().sort({ date: -1 }); // sort by date descending
            res.json(posts);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Private
router.get(
    '/:id',
    auth,
    async (req, res) => {
        try {
            // get post from mongodb
            const post = await Post.findById(req.params.id);

            // check if post exists
            if (!post) {
                return res.status(404).json({ msg: 'Post not found' });
            }

            // return the post
            res.json(post);
        } catch (error) {
            console.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Post not found' });
            }
            return res.status(500).send('Server Error');
        }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete(
    '/:id',
    auth,
    async (req, res) => {
        try {
            // get post from db
            const post = await Post.findById(req.params.id);

            // check if post exists
            if (!post) {
                return res.status(404).json({ msg: 'Post not found' });
            }

            // check if user owns the post to delete
            if (post.user.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'User not authorized' });
            }

            // delete the post
            await post.remove();

            // return the post
            res.json({ msg: 'Post removed' });
        } catch (err) {
            console.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Post not found' });
            }
            return res.status(500).send('Server Error');
        }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put(
    '/like/:id',
    auth,
    async (req, res) => {
        try {
            // get post from db using the id from the url
            const post = await Post.findById(req.params.id);

            // check if the post has already been liked by the user
            if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) { // returns greater than 0 if the post has already been liked by the user
                return res.status(400).json({ msg: 'Post already liked' });
            }

            // add the like to the post
            post.likes.unshift({ user: req.user.id });
            await post.save();
            res.json(post.likes);

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put(
    '/unlike/:id',
    auth,
    async (req, res) => {
        try {
            // get post from db using the id from the url
            const post = await Post.findById(req.params.id);

            // check if the post has already been liked by the user
            if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) { // returns 0 if the post has not been liked by the user
                return res.status(400).json({ msg: 'Post has not yet been liked' });
            }

            // get remove index
            const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

            // remove the like from the post
            post.likes.splice(removeIndex, 1);
            await post.save();
            res.json(post.likes);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post(
    '/comment/:id',
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
            // get user from db using the id from the token without the password
            const user = await User.findById(req.user.id).select('-password');

            // get post from db using the id from the url
            const post = await Post.findById(req.params.id);

            // create a new comment
            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            // add the comment to the post
            post.comments.unshift(newComment); // add to the beginning of the array
            await post.save();

            // return the post
            res.json(post.comments);

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment from a post
// @access  Private
router.delete(
    '/comment/:id/:comment_id',
    auth,
    async (req, res) => {
        try {
            // get post from db using the id from the url
            const post = await Post.findById(req.params.id);

            // get comment from the post
            const comment = post.comments.find(comment => comment.id === req.params.comment_id);

            // Make sure comment exists
            if (!comment) {
                return res.status(404).json({ msg: 'Comment does not exist' });
            }

            // check if user owns the comment to delete
            if (comment.user.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'User not authorized' });
            }

            // get remove index
            const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

            // remove the comment from the post
            post.comments.splice(removeIndex, 1);
            await post.save();

            // return the post
            res.json(post.comments);

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);



// export the router
module.exports = router;
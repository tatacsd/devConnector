const express = require('express');
const router = express.Router();

// @route   GET api/posts
// @desc    Test route
// @access  Public
router.get('/', (req, res) => res.send('Posts route'));


// export the router
module.exports = router;
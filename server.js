const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');

// Connect Database
connectDB();

// Init Middleware -> to be able to use req.body
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// test endpoint
app.get('/', (req, res) => res.send('API Running'));


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
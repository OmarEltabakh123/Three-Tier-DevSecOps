const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json());

mongoose.connect('mongodb://mongodb:27017/three-tier', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Backend!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

app.get('/api/v1', (req, res) => {
  res.json({ message: 'API v1 root' });
});

app.get('/docs', (req, res) => {
  res.send('<h1>API Documentation Coming Soon</h1>');
});

app.listen(5000, () => console.log('Server running on port 5000'));

// src/index.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(cors());             // หรือใช้ proxy ฝั่ง client ก็ได้ (จะพูดต่อไป)
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('API is running'));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

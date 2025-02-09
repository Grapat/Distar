const express = require('express');
const app = express();
const { Sequelize } = require('sequelize');
const path = require('path');
const cors = require('cors');

//middleware
require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:false }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

//controller
const vegController = require('./controller/Vegetable_Controller');
app.use('/api/vegs', vegController);

//listen
app.listen(4005, () => {
    console.log('server running on 4005');
});

// Handle all other routes and serve the Vite-built frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

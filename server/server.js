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

//controller
const vegController = require('./controller/Vegetable_Controller');
app.use('/api/vegs', vegController);

//listen
app.listen(4005, () => {
    console.log('server running on 4005')
})
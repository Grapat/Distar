const vegetables = require('express').Router();
const db = require('../models');
const { Vegetable } = db;

//get all
vegetables.get('/', async (req, res) => {
    try {
        const foundVegs = await Vegetable.findAll();
        res.status(200).json(foundVegs);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = vegetables
const express = require('express');
const router = express.Router();
const vegController = require('../controller/Vegetable_Controller');

router.get('/', vegController.getAllVegetables);
router.get('/:id', vegController.getVegetableById);
router.post('/', vegController.createVegetable);

module.exports = router;

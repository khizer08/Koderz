const express = require('express');
const router = express.Router();
const AlgorithmController = require('../controllers/algorithmController');

router.get('/', AlgorithmController.getAll);
router.get('/:slug', AlgorithmController.getBySlug);
router.post('/visualize', AlgorithmController.visualize);

module.exports = router;

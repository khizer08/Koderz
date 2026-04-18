const express = require('express');
const router = express.Router();
const ComparisonController = require('../controllers/comparisonController');

router.post('/benchmark', ComparisonController.benchmark);

module.exports = router;

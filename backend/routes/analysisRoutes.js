const express = require('express');
const router = express.Router();
const AnalysisController = require('../controllers/analysisController');

router.post('/analyze', AnalysisController.analyze);
router.get('/history/:sessionId', AnalysisController.getHistory);
router.get('/:id', AnalysisController.getById);
router.delete('/:id', AnalysisController.deleteAnalysis);

module.exports = router;

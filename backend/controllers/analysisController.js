const { v4: uuidv4 } = require('uuid');
const Analysis = require('../models/Analysis');
const AnalysisService = require('../services/analysisService');

/**
 * AnalysisController — MVC Controller
 * Handles all /api/analysis routes
 */
class AnalysisController {
  /**
   * POST /api/analysis/analyze
   * Analyze code complexity
   */
  static async analyze(req, res, next) {
    try {
      const { code, language = 'python', sessionId = uuidv4() } = req.body;

      if (!code || code.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Code is required' });
      }

      if (code.length > 50000) {
        return res.status(400).json({ success: false, message: 'Code too large (max 50,000 chars)' });
      }

      // Call analysis service
      const result = await AnalysisService.analyzeComplexity(code, language);

      // Persist to DB
      const analysis = await Analysis.create({
        sessionId,
        code,
        language,
        result,
        executionTime: result.executionTime,
      });

      res.status(201).json({
        success: true,
        data: {
          id: analysis._id,
          sessionId,
          result,
          language,
          analyzedAt: analysis.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/analysis/history/:sessionId
   * Get analysis history for a session
   */
  static async getHistory(req, res, next) {
    try {
      const { sessionId } = req.params;
      const history = await Analysis.find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('-code');

      res.json({
        success: true,
        data: history,
        count: history.length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/analysis/:id
   * Get single analysis by ID
   */
  static async getById(req, res, next) {
    try {
      const analysis = await Analysis.findById(req.params.id);
      if (!analysis) {
        return res.status(404).json({ success: false, message: 'Analysis not found' });
      }
      res.json({ success: true, data: analysis });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/analysis/:id
   * Delete an analysis
   */
  static async deleteAnalysis(req, res, next) {
    try {
      await Analysis.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Analysis deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AnalysisController;

const Algorithm = require('../models/Algorithm');
const AlgorithmService = require('../services/algorithmService');
const algorithmData = require('../config/algorithmData');

class AlgorithmController {
  /**
   * GET /api/algorithms
   * List all algorithms
   */
  static async getAll(req, res, next) {
    try {
      const { category } = req.query;
      const filter = category ? { category } : {};

      // Try DB first, fallback to static data
      let algorithms;
      try {
        algorithms = await Algorithm.find(filter).select('-code -pseudocode');
        if (algorithms.length === 0) algorithms = algorithmData.filter(a => !category || a.category === category);
      } catch {
        algorithms = algorithmData.filter(a => !category || a.category === category);
      }

      res.json({ success: true, data: algorithms, count: algorithms.length });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/algorithms/:slug
   * Get single algorithm details
   */
  static async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      let algorithm;
      try {
        algorithm = await Algorithm.findOne({ slug });
      } catch {}

      if (!algorithm) {
        algorithm = algorithmData.find(a => a.slug === slug);
      }

      if (!algorithm) {
        return res.status(404).json({ success: false, message: 'Algorithm not found' });
      }

      res.json({ success: true, data: algorithm });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/algorithms/visualize
   * Generate step-by-step trace for visualization
   */
  static async visualize(req, res, next) {
    try {
      const { algorithm, array } = req.body;

      if (!algorithm || !array || !Array.isArray(array)) {
        return res.status(400).json({ success: false, message: 'algorithm and array are required' });
      }

      if (array.length > 50) {
        return res.status(400).json({ success: false, message: 'Array too large (max 50 elements)' });
      }

      const steps = AlgorithmService.generateSortTrace(algorithm, array);

      res.json({
        success: true,
        data: {
          algorithm,
          inputArray: array,
          steps,
          totalSteps: steps.length,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AlgorithmController;

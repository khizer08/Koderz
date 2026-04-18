const AlgorithmService = require('../services/algorithmService');

class ComparisonController {
  /**
   * POST /api/comparison/benchmark
   * Generate runtime benchmark data for two algorithms
   */
  static async benchmark(req, res, next) {
    try {
      const { algo1, algo2, sizes } = req.body;

      if (!algo1 || !algo2) {
        return res.status(400).json({ success: false, message: 'Two algorithm slugs are required' });
      }

      const benchmarkData = AlgorithmService.generateBenchmarkData(
        algo1,
        algo2,
        sizes || [10, 50, 100, 500, 1000, 5000]
      );

      const complexityInfo = {
        bubble: { time: 'O(n²)', space: 'O(1)', stable: true },
        selection: { time: 'O(n²)', space: 'O(1)', stable: false },
        insertion: { time: 'O(n²)', space: 'O(1)', stable: true },
        merge: { time: 'O(n log n)', space: 'O(n)', stable: true },
        quick: { time: 'O(n log n)', space: 'O(log n)', stable: false },
        binary: { time: 'O(log n)', space: 'O(1)', stable: null },
      };

      res.json({
        success: true,
        data: {
          algo1: { slug: algo1, ...complexityInfo[algo1] },
          algo2: { slug: algo2, ...complexityInfo[algo2] },
          benchmarkData,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ComparisonController;

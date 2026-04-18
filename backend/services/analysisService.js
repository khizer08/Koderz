const { spawn } = require('child_process');
const path = require('path');

/**
 * AnalysisService — calls the Python AST analyzer subprocess
 * Returns a structured complexity result
 */
class AnalysisService {
  /**
   * Analyze code complexity using Python AST parser
   * @param {string} code - Source code to analyze
   * @param {string} language - Programming language
   * @returns {Promise<Object>} Analysis result
   */
  static async analyzeComplexity(code, language = 'python') {
    return new Promise((resolve, reject) => {
      const analyzerPath = path.join(__dirname, '../../analyzer/analyzer.py');
      const startTime = Date.now();

      const process = spawn('python3', [analyzerPath], {
        timeout: 15000,
      });

      let output = '';
      let errorOutput = '';

      // Send code via stdin
      process.stdin.write(JSON.stringify({ code, language }));
      process.stdin.end();

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (exitCode) => {
        const executionTime = Date.now() - startTime;

        if (exitCode !== 0) {
          // Fallback to JS-based heuristic analyzer if Python fails
          return resolve({
            ...AnalysisService.heuristicAnalysis(code, language),
            executionTime,
            fallback: true,
          });
        }

        try {
          const result = JSON.parse(output.trim());
          resolve({ ...result, executionTime });
        } catch {
          resolve({
            ...AnalysisService.heuristicAnalysis(code, language),
            executionTime,
            fallback: true,
          });
        }
      });

      process.on('error', () => {
        const executionTime = Date.now() - startTime;
        resolve({
          ...AnalysisService.heuristicAnalysis(code, language),
          executionTime,
          fallback: true,
        });
      });
    });
  }

  /**
   * JS-based heuristic fallback analyzer
   * Used when Python is not available
   */
  static heuristicAnalysis(code, language) {
    const lines = code.split('\n');
    let loops = 0;
    let nestedLoops = 0;
    let recursion = false;
    let logarithmic = false;
    const patterns = [];

    // Detect function name for recursion check
    const funcNameMatch = code.match(/def\s+(\w+)|function\s+(\w+)/);
    const funcName = funcNameMatch ? (funcNameMatch[1] || funcNameMatch[2]) : null;

    let loopDepth = 0;
    let maxLoopDepth = 0;

    for (const line of lines) {
      const stripped = line.trim();

      // Loop detection
      const isLoop =
        /^for\s/.test(stripped) ||
        /^while\s/.test(stripped) ||
        /\.forEach|\.map|\.filter|\.reduce/.test(stripped);

      if (isLoop) {
        const indent = line.length - line.trimStart().length;
        loops++;
        // Rough nesting detection by indentation
        if (loops > 1) {
          nestedLoops++;
          maxLoopDepth = Math.max(maxLoopDepth, 2);
        }
      }

      // Recursion
      if (funcName && new RegExp(`\\b${funcName}\\s*\\(`).test(stripped)) {
        recursion = true;
      }

      // Log-based loop
      if (/\/\s*2|>>/.test(stripped) && isLoop) {
        logarithmic = true;
      }
    }

    // Determine complexity
    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';

    if (recursion && logarithmic) {
      timeComplexity = 'O(log n)';
      patterns.push('Recursive with halving');
    } else if (recursion) {
      timeComplexity = 'O(n)';
      spaceComplexity = 'O(n)';
      patterns.push('Recursion');
    } else if (nestedLoops >= 1) {
      timeComplexity = 'O(n²)';
      patterns.push('Nested Loops');
    } else if (loops >= 1) {
      timeComplexity = 'O(n)';
      patterns.push('Single Loop');
    } else if (logarithmic) {
      timeComplexity = 'O(log n)';
      patterns.push('Logarithmic');
    }

    const suggestions = AnalysisService.generateSuggestions(timeComplexity, patterns);

    return {
      timeComplexity,
      spaceComplexity,
      detectedPatterns: patterns,
      loops,
      nestedLoops,
      recursion,
      confidence: 75,
      explanation: AnalysisService.generateExplanation(timeComplexity, patterns),
      suggestions,
    };
  }

  static generateExplanation(complexity, patterns) {
    const map = {
      'O(1)': 'No loops or recursion detected. The code runs in constant time regardless of input size.',
      'O(log n)': 'Detected logarithmic pattern — the input is halved each iteration, making this very efficient.',
      'O(n)': 'A single loop iterates over the input once, giving linear time complexity.',
      'O(n²)': 'Nested loops detected — for every element, the inner loop processes all elements again.',
      'O(n log n)': 'Divide-and-conquer pattern detected — input is split recursively and merged.',
    };
    return map[complexity] || `Complexity detected as ${complexity} based on code structure.`;
  }

  static generateSuggestions(complexity, patterns) {
    const suggestions = [];
    if (complexity === 'O(n²)') {
      suggestions.push('Consider replacing nested loops with a hash map for O(n) lookups.');
      suggestions.push('Evaluate if a sorting-based approach could reduce to O(n log n).');
    }
    if (patterns.includes('Recursion')) {
      suggestions.push('Consider memoization (dynamic programming) to avoid redundant computation.');
      suggestions.push('Iterative approach may reduce O(n) stack space to O(1).');
    }
    if (complexity === 'O(n)') {
      suggestions.push('Linear time is good! Verify no hidden inner loops in called functions.');
    }
    return suggestions;
  }
}

module.exports = AnalysisService;

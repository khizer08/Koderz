const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    code: { type: String, required: true },
    language: { type: String, default: 'python', enum: ['python', 'javascript', 'java', 'cpp'] },
    result: {
      timeComplexity: { type: String },
      spaceComplexity: { type: String },
      detectedPatterns: [{ type: String }],
      explanation: { type: String },
      suggestions: [{ type: String }],
      loops: { type: Number, default: 0 },
      nestedLoops: { type: Number, default: 0 },
      recursion: { type: Boolean, default: false },
      confidence: { type: Number, min: 0, max: 100 },
    },
    executionTime: { type: Number }, // ms
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', analysisSchema);

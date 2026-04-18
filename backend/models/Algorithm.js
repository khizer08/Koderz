const mongoose = require('mongoose');

const algorithmSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['sorting', 'searching', 'graph', 'dynamic-programming', 'greedy'],
      required: true,
    },
    description: { type: String, required: true },
    timeComplexity: {
      best: String,
      average: String,
      worst: String,
    },
    spaceComplexity: String,
    stable: Boolean,
    inPlace: Boolean,
    pseudocode: String,
    code: {
      python: String,
      javascript: String,
    },
    steps: [{ type: String }],
    useCases: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Algorithm', algorithmSchema);

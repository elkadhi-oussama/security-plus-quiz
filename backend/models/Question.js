const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    enum: [
      'Summarize fundamental security concepts',
      'Compare threat types',
      'Explain appropriate cryptographic solutions',
      'Implement identity and access management',
      'Secure enterprise network architecture',
      'Secure cloud network architecture',
      'Explain resiliency and site security concepts',
      'Explain vulnerability management',
      'Evaluate network security capabilities',
      'Assess endpoint security capabilities',
      'Enhance application security capabilities',
      'Explain incident response and monitoring concepts',
      'Analyze indicators of malicious activity',
      'Summarize security governance concepts',
      'Explain risk management processes',
      'Summarize data protection and compliance concepts'
    ]
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [
      {
        validator: function(v) {
          return v.length === 4;
        },
        message: 'Questions must have exactly 4 options'
      }
    ]
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return this.options.includes(v);
      },
      message: 'Correct answer must be one of the options'
    }
  },
  explanation: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question; 
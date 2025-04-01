const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get all topics
router.get('/topics', async (req, res) => {
  try {
    // Get the topics directly from the Question model's schema
    const topics = Question.schema.path('topic').enumValues;
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get questions by topic
router.get('/questions/:topic', auth, async (req, res) => {
  try {
    const questions = await Question.find({ topic: req.params.topic });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz answers
router.post('/submit', auth, async (req, res) => {
  try {
    const { topic, answers } = req.body;
    const questions = await Question.find({ topic });
    
    let score = 0;
    questions.forEach((question, index) => {
      if (question.correctAnswer === answers[index]) {
        score++;
      }
    });

    const percentage = (score / questions.length) * 100;

    // Update user progress
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        progress: {
          topic,
          score: percentage,
          completedAt: new Date()
        }
      }
    });

    res.json({
      score: percentage,
      totalQuestions: questions.length,
      correctAnswers: score
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user progress
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('progress');
    res.json(user.progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 
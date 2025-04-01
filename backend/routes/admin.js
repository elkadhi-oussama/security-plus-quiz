const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all questions (admin only)
router.get('/questions', auth, admin, async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new question (admin only)
router.post('/questions', auth, admin, async (req, res) => {
  try {
    console.log('Received question data:', req.body); // Debug log

    const { topic, question, options, correctAnswer, explanation, difficulty } = req.body;

    // Validate required fields
    if (!topic || !question || !options || !correctAnswer || !explanation) {
      return res.status(400).json({ 
        message: 'All fields are required',
        receivedData: req.body 
      });
    }

    // Validate options array
    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ 
        message: 'Options must be an array of exactly 4 items',
        receivedOptions: options 
      });
    }

    // Validate correct answer is in options
    if (!options.includes(correctAnswer)) {
      return res.status(400).json({ 
        message: 'Correct answer must be one of the options',
        correctAnswer,
        options 
      });
    }

    const newQuestion = new Question({
      topic,
      question,
      options,
      correctAnswer,
      explanation,
      difficulty: difficulty || 'medium'
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.message 
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a question (admin only)
router.put('/questions/:id', auth, admin, async (req, res) => {
  try {
    const { topic, question, options, correctAnswer, explanation, difficulty } = req.body;

    // Validate required fields
    if (!topic || !question || !options || !correctAnswer || !explanation) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      {
        topic,
        question,
        options,
        correctAnswer,
        explanation,
        difficulty: difficulty || 'medium'
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a question (admin only)
router.delete('/questions/:id', auth, admin, async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
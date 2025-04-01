import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Quiz = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/quiz/questions/${encodeURIComponent(topic)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setQuestions(response.data);
      } catch (error) {
        setError('Failed to load quiz questions. Please try again later.');
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [topic]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer) => {
    if (!showExplanation) {
      setSelectedAnswer(answer);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Quiz Completed!</h2>
        <div className="text-center mb-6">
          <p className="text-xl mb-2">
            Your Score: {score} out of {questions.length}
          </p>
          <p className="text-lg font-semibold">
            Percentage: {percentage.toFixed(1)}%
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleRestartQuiz}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Restart Quiz
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{topic}</h2>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <p className="text-gray-600">
            Score: {score}/{currentQuestionIndex}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-lg font-medium mb-4">{currentQuestion?.question}</p>
        <div className="space-y-3">
          {currentQuestion?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full p-3 text-left rounded-md transition-colors ${
                selectedAnswer === option
                  ? showExplanation
                    ? option === currentQuestion.correctAnswer
                      ? 'bg-green-100 border-green-500'
                      : 'bg-red-100 border-red-500'
                    : 'bg-primary-100 border-primary-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              } border ${
                showExplanation && option === currentQuestion.correctAnswer
                  ? 'border-green-500'
                  : 'border-gray-300'
              }`}
              disabled={showExplanation}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {showExplanation && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <p className="font-medium mb-2">Explanation:</p>
          <p>{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="flex justify-end">
        {!showExplanation ? (
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            {currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz; 
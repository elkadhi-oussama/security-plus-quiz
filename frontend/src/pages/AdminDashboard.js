import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium'
  });

  useEffect(() => {
    fetchTopics();
    fetchQuestions();
  }, []);

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view topics');
        return;
      }

      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.get('https://security-plus-quiz-api.vercel.app/api/quiz/topics', config);
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to fetch topics. Please check your admin privileges.');
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view questions');
        return;
      }

      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      setLoading(true);
      const response = await axios.get('https://security-plus-quiz-api.vercel.app/api/admin/questions', config);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to fetch questions. Please check your admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to perform this action');
        return;
      }

      // Validate topic
      if (!formData.topic || !topics.includes(formData.topic)) {
        setError('Please select a valid topic from the list');
        return;
      }

      // Validate options array
      const validOptions = formData.options.filter(option => option.trim() !== '');
      if (validOptions.length !== 4) {
        setError('Please provide exactly 4 options');
        return;
      }

      // Validate correct answer
      if (!formData.correctAnswer || !formData.options.includes(formData.correctAnswer)) {
        setError('Correct answer must be one of the options');
        return;
      }

      const questionData = {
        ...formData,
        options: formData.options.map(opt => opt.trim())
      };

      console.log('Sending question data:', questionData); // Debug log

      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (editingId) {
        await axios.put(
          `https://security-plus-quiz-api.vercel.app/api/admin/questions/${editingId}`,
          questionData,
          config
        );
      } else {
        await axios.post(
          'https://security-plus-quiz-api.vercel.app/api/admin/questions',
          questionData,
          config
        );
      }
      
      fetchQuestions();
      resetForm();
    } catch (error) {
      console.error('Error saving question:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to save question. Please check your admin privileges.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to delete questions');
        return;
      }

      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.delete(`https://security-plus-quiz-api.vercel.app/api/admin/questions/${id}`, config);
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to delete question. Please check your admin privileges.');
    }
  };

  const handleEdit = (question) => {
    setEditingId(question._id);
    setFormData({
      topic: question.topic,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      topic: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      difficulty: 'medium'
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Question Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Question' : 'Add New Question'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Topic</label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select a topic</option>
              {topics.map((topic, index) => (
                <option key={index} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Question</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              required
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            {formData.options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 mb-2"
              />
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
            <select
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select correct answer</option>
              {formData.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Explanation</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              required
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {editingId ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Questions List</h2>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All Topics</option>
            {topics.map((topic, index) => (
              <option key={index} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {questions
            .filter((q) => !selectedTopic || q.topic === selectedTopic)
            .map((question) => (
              <div
                key={question._id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">{question.question}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">Topic: {question.topic}</p>
                <p className="text-sm text-gray-500 mb-2">
                  Difficulty: {question.difficulty}
                </p>
                <div className="space-y-1">
                  {question.options.map((option, index) => (
                    <p
                      key={index}
                      className={`text-sm ${
                        option === question.correctAnswer
                          ? 'text-green-600 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      {index + 1}. {option}
                    </p>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
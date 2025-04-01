import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get('https://security-plus-quiz-api.vercel.app/api/quiz/topics');
        setTopics(response.data);
      } catch (error) {
        setError('Failed to load topics');
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Security+ Quiz Platform
        </h1>
        <p className="text-xl text-gray-600">
          Test your knowledge across all Security+ exam objectives
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic, index) => (
          <Link
            key={index}
            to={`/quiz/${encodeURIComponent(topic)}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start">
                <span className="flex-shrink-0 bg-primary-100 text-primary-800 text-sm font-semibold px-3 py-1 rounded-full">
                  Topic {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {topic}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Click to start the quiz on this topic
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home; 
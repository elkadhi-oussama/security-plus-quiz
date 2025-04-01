import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [profileResponse, historyResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/users/quiz-history', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setProfile(profileResponse.data);
        setQuizHistory(historyResponse.data);
      } catch (error) {
        setError('Failed to load profile data. Please try again later.');
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

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
      </div>
    );
  }

  const calculateOverallProgress = () => {
    if (!quizHistory.length) return 0;
    const totalScore = quizHistory.reduce((sum, quiz) => sum + quiz.score, 0);
    const totalQuestions = quizHistory.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
    return ((totalScore / totalQuestions) * 100).toFixed(1);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-8">
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Username</p>
            <p className="font-medium">{profile?.username}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Overall Progress</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded-full">
              <div
                className="h-4 bg-primary-600 rounded-full"
                style={{ width: `${calculateOverallProgress()}%` }}
              ></div>
            </div>
          </div>
          <span className="text-lg font-medium">{calculateOverallProgress()}%</span>
        </div>
      </div>

      {/* Quiz History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Quiz History</h2>
        {quizHistory.length === 0 ? (
          <p className="text-gray-600">No quizzes taken yet.</p>
        ) : (
          <div className="space-y-4">
            {quizHistory.map((quiz, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">{quiz.topic}</h3>
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    {(quiz.score / quiz.totalQuestions * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Score: {quiz.score}/{quiz.totalQuestions}</p>
                  <p>Date: {new Date(quiz.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 
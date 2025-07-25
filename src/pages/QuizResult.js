import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { initialContent } from '../constants/contentData'; // Import initialContent

const QuizResult = ({ navigate, locationState }) => {
  const { user } = useAuth();
  const score = locationState?.state?.score ?? 0;
  const total = locationState?.state?.total ?? 0;
  const newLevel = locationState?.state?.newLevel ?? 1;
  const oldLevel = locationState?.state?.oldLevel ?? 1;
  const subject = locationState?.state?.subject;
  const quizSkills = locationState?.state?.quizSkills || [];
  const nextContentId = locationState?.state?.nextContentId;

  if (!user || total < 0) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-600 mb-4">Results not found. Please complete a quiz first.</p>
        <button onClick={() => navigate('/')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const percentage = total > 0 ? (score / total) * 100 : 0;

  const handlePracticeMore = () => {
    navigate('/practice', { state: { skillsToPractice: quizSkills } });
  };

  const handleContinueLearning = () => {
    if (nextContentId) {
      const nextContentItem = initialContent.find(c => c.id === nextContentId);
      if (nextContentItem) {
        if (nextContentItem.type === 'quiz' || nextContentItem.type === 'boss_battle') {
          navigate(`/quiz/${nextContentItem.id}`);
        } else {
          navigate(`/learn/${nextContentItem.id}`);
        }
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg text-center">
      <h2 className="text-3xl font-bold mb-6 text-teal-700">Quiz Result</h2>
      <p className="text-xl mb-4">You scored <span className="font-semibold text-blue-600">{score}</span> out of <span className="font-semibold text-blue-600">{total}</span> questions correct!</p>
      {percentage >= 70 ? (
        <>
          <p className="text-green-600 text-2xl font-bold mb-4">Hooray! You completed the quiz successfully!</p>
          {newLevel > oldLevel ? (
            <p className="text-xl text-gray-800 mb-6">You have leveled up to **Level {newLevel}** in {subject}! Keep up the good work!</p>
          ) : (
            <p className="text-xl text-gray-800 mb-6">You've mastered this! Ready for more challenges?</p>
          )}
        </>
      ) : (
        <>
          <p className="text-orange-600 text-2xl font-bold mb-4">You're doing well, keep practicing!</p>
          <p className="text-xl text-gray-800 mb-6">Let's review Level {oldLevel} concepts in {subject} before moving on.</p>
          <button
            onClick={handlePracticeMore}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out mt-4"
          >
            Practice More on These Skills
          </button>
        </>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={handleContinueLearning}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out mr-4"
        >
          Continue Learning
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizResult;
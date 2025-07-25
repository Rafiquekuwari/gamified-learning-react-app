import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { initialContent } from '../constants/contentData'; // Import initialContent

const Quiz = ({ navigate, currentPath }) => {
  const quizId = currentPath.split('/quiz/')[1];
  const [quizContent, setQuizContent] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const { user, updateUser } = useAuth();
  const quizQuestionsRef = useRef([]);

  useEffect(() => {
    const fetchQuiz = () => {
      setTimeout(() => {
        const content = initialContent.find(c => c.id === quizId && (c.type === 'quiz' || c.type === 'boss_battle'));
        
        if (content && user.subject_levels[content.subject] >= content.level) {
          setQuizContent(content);
          quizQuestionsRef.current = JSON.parse(content.content_data);
          setLoading(false);
        } else {
          setError('Quiz not found or not unlocked.');
          setLoading(false);
        }
      }, 500);
    };
    if(user) {
      fetchQuiz();
    }
  }, [quizId, user]);

  const currentQuestion = quizQuestionsRef.current[currentQuestionIndex];

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) {
      setFeedback('Please select an option.');
      return;
    }

    const updatedUserAnswers = {
      ...userAnswers,
      [currentQuestionIndex]: selectedOption
    };
    setUserAnswers(updatedUserAnswers);

    let newPoints = user.points;

    if (selectedOption === currentQuestion.answer) {
      newPoints += 2;
      setFeedback(currentQuestion.feedback_correct || 'Correct!');
    } else {
      setFeedback(currentQuestion.feedback_incorrect || 'Incorrect. Try again!');
    }

    const updatedUserPoints = { ...user, points: newPoints };
    await updateUser(updatedUserPoints);

    setTimeout(() => {
      setFeedback('');
      setSelectedOption(null);

      const isLastQuestion = currentQuestionIndex === quizQuestionsRef.current.length - 1;

      if (isLastQuestion) {
        let finalScore = 0;
        const totalQuestions = quizQuestionsRef.current.length;

        quizQuestionsRef.current.forEach((q, index) => {
          if (updatedUserAnswers[index] === q.answer) {
            finalScore += 1;
          }
        });

        const quizPassed = (finalScore / totalQuestions) >= 0.7;
        const subjectOfQuiz = quizContent.subject;
        const currentSubjectLevel = user.subject_levels[subjectOfQuiz];
        let newSubjectLevel = currentSubjectLevel; // Default to the current level
        let finalPoints = newPoints;
        const updatedSkillProficiency = { ...user.progress_data.skillProficiency };
        const finalScorePercentage = totalQuestions > 0 ? (finalScore / totalQuestions) : 0;
        
        if (quizContent.skill_tags) {
            quizContent.skill_tags.forEach(skill => {
                updatedSkillProficiency[skill] = finalScorePercentage;
            });
        }

        const updatedSubjectProgress = { ...user.progress_data.subjectProgress };
        updatedSubjectProgress[quizContent.subject] = quizContent.id;

        const updatedLastQuizResult = { ...user.progress_data.lastQuizResult };
        updatedLastQuizResult[quizContent.subject] = { score: finalScore, total: totalQuestions, percentage: finalScorePercentage, level: quizContent.level };


        const finalProgressData = {
            ...user.progress_data,
            [`level_${quizContent.level}_last_quiz_score`]: finalScore,
            [`level_${quizContent.level}_last_quiz_max_score`]: totalQuestions,
            skillProficiency: updatedSkillProficiency,
            subjectProgress: updatedSubjectProgress,
            lastQuizResult: updatedLastQuizResult
        };

        // *** THIS IS THE NEW LEVELING LOGIC ***
        if (quizPassed) {
          if (quizContent.next_content_id) {
            const nextContentItem = initialContent.find(c => c.id === quizContent.next_content_id);
            // Only level up if the next content item exists and is on a higher level
            if (nextContentItem && nextContentItem.level > currentSubjectLevel) {
              newSubjectLevel = nextContentItem.level;
            }
          } else {
            // If this is the very last content for the subject, level up
            newSubjectLevel = currentSubjectLevel + 1;
          }
        }


        const updatedUserFinal = {
            ...user,
            points: finalPoints,
            subject_levels: {
                ...user.subject_levels,
                [subjectOfQuiz]: newSubjectLevel
            },
            progress_data: finalProgressData
        };
        updateUser(updatedUserFinal);

        navigate('/quiz-result', { state: { score: finalScore, total: totalQuestions, newLevel: newSubjectLevel, oldLevel: currentSubjectLevel, quizPassed: quizPassed, nextContentId: quizContent.next_content_id, subject: subjectOfQuiz } });

      } else {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      }
    }, 1500);
  };


  if (loading) return <div className="text-center text-gray-600 mt-10">Loading quiz...</div>;
  if (error) return <div className="text-red-600 text-center mt-10">{error}</div>;
  if (!quizContent || !currentQuestion) return <div className="text-center text-gray-600 mt-10">Quiz content not available.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h2 className={`text-3xl font-bold mb-6 text-center ${quizContent.type === 'boss_battle' ? 'text-red-700' : 'text-teal-700'}`}>
        {quizContent.type === 'boss_battle' ? 'Boss Battle: ' : 'Quiz: '} {quizContent.title}
      </h2>
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
        <p className="text-lg font-semibold mb-3">
          {currentQuestionIndex + 1}. {currentQuestion.q}
        </p>
        {currentQuestion.img && (
          <img src={currentQuestion.img} alt="Question illustration" className="w-full max-w-[100px] h-[100px] mx-auto rounded-lg shadow-md mb-4" />
        )}
        <div className="space-y-2">
          {currentQuestion.options.map((option, optIndex) => (
            <label key={optIndex} className="flex items-center text-gray-700 cursor-pointer">
              <input
                type="radio"
                name={`q_${currentQuestionIndex}`}
                value={option}
                onChange={() => setSelectedOption(option)}
                checked={selectedOption === option}
                className="form-radio h-5 w-5 text-teal-600"
              />
              <span className="ml-2 text-base">{option}</span>
            </label>
          ))}
        </div>
      </div>
      {feedback && <p className={`text-center font-bold mb-4 ${feedback.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
      <button
        onClick={handleSubmitAnswer}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
      >
        Submit Answer
      </button>
    </div>
  );
};

export default Quiz;
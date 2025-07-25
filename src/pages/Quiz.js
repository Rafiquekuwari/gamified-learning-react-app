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
  const [userAnswers, setUserAnswers] = useState({}); // State to store answers for all questions in the quiz
  const { user, updateUser } = useAuth();
  const quizQuestionsRef = useRef([]); // To store parsed questions

  useEffect(() => {
    const fetchQuiz = () => {
      setTimeout(() => {
        const content = initialContent.find(c => c.id === quizId && (c.type === 'quiz' || c.type === 'boss_battle'));
        if (content && user.current_level >= content.level) {
          setQuizContent(content);
          quizQuestionsRef.current = JSON.parse(content.content_data);
          setLoading(false);
        } else {
          setError('Quiz not found or not unlocked.');
          setLoading(false);
        }
      }, 500);
    };
    fetchQuiz();
  }, [quizId, user]);

  const currentQuestion = quizQuestionsRef.current[currentQuestionIndex];

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) {
      setFeedback('Please select an option.');
      return;
    }

    // Store the answer for the current question
    const updatedUserAnswers = {
      ...userAnswers,
      [currentQuestionIndex]: selectedOption
    };
    setUserAnswers(updatedUserAnswers); // Update state

    let newPoints = user.points;
    let isCorrect = false;

    if (selectedOption === currentQuestion.answer) {
      isCorrect = true;
      newPoints += 2; // Award 2 points for correct answer in quiz/boss battle
      setFeedback(currentQuestion.feedback_correct || 'Correct!');
    } else {
      setFeedback(currentQuestion.feedback_incorrect || 'Incorrect. Try again!');
    }

    // Update user points immediately after each question
    const updatedUserPoints = { ...user, points: newPoints };
    await updateUser(updatedUserPoints);

    // Move to next question or end quiz after feedback
    setTimeout(() => {
      setFeedback('');
      setSelectedOption(null); // Clear selection for next question

      // Determine if this is the last question
      const isLastQuestion = currentQuestionIndex === quizQuestionsRef.current.length - 1;

      if (isLastQuestion) {
        // Calculate final score immediately for the last question
        let finalScore = 0;
        const totalQuestions = quizQuestionsRef.current.length;

        // Use the *latest* updatedUserAnswers for final calculation
        quizQuestionsRef.current.forEach((q, index) => {
          if (updatedUserAnswers[index] === q.answer) { // Use updatedUserAnswers here, which includes the current question's answer
            finalScore += 1;
          }
        });

        const quizPassed = (finalScore / totalQuestions) >= 0.7;
        let newLevel = user.current_level;
        let finalPoints = newPoints; // Use newPoints updated from current submission

        // Update skill proficiency based on overall quiz percentage (more granular)
        const updatedSkillProficiency = { ...user.progress_data.skillProficiency };
        const finalScorePercentage = totalQuestions > 0 ? (finalScore / totalQuestions) : 0;
        
        if (quizContent.skill_tags) {
            quizContent.skill_tags.forEach(skill => {
                // Directly set proficiency to the quiz percentage for the relevant skills
                updatedSkillProficiency[skill] = finalScorePercentage;
            });
        }

        // Update subject progress for the current content item's subject
        const updatedSubjectProgress = { ...user.progress_data.subjectProgress };
        updatedSubjectProgress[quizContent.subject] = quizContent.id; // Mark this quiz as the last completed for the subject

        // Update last quiz result for this subject
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


        if (quizPassed && quizContent.next_content_id) {
            const nextContentItem = initialContent.find(c => c.id === quizContent.next_content_id);
            if (nextContentItem && nextContentItem.level > user.current_level) {
                newLevel = nextContentItem.level; // Advance to the next level
            }
        } else if (quizPassed && !quizContent.next_content_id) {
            // This is the absolute last content item and it was passed
            newLevel = user.current_level + 1; // Or mark as completed all levels
        }


        const updatedUserFinal = {
            ...user,
            points: finalPoints,
            current_level: newLevel,
            progress_data: finalProgressData
        };
        updateUser(updatedUserFinal); // Don't await, let it run in background

        // Navigate to quiz result page
        navigate('/quiz-result', { state: { score: finalScore, total: totalQuestions, newLevel: newLevel, quizSkills: quizContent.skill_tags, quizPassed: quizPassed, nextContentId: quizContent.next_content_id } }); // Pass nextContentId

      } else {
        // Not the last question, just advance to the next one
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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Simulate a database of content (needed for quiz questions)
const initialContent = [
  { id: 'diag_q1', type: 'diagnostic_quiz', level: 0, subject: 'math', q: "What comes after 5?", options: ["4", "6", "7"], answer: "6" },
  { id: 'diag_q2', type: 'diagnostic_quiz', level: 0, subject: 'literacy', q: "Which letter comes after 'A'?", options: ["B", "C", "D"], answer: "B" },
  { id: 'lesson_1_1', type: 'lesson', level: 1, subject: 'math', title: 'Numbers 1-10', content_data: '{"text": "Let\'s learn numbers from 1 to 10! Look at the pictures and count."}', next_content_id: 'quiz_1_1' },
  { id: 'quiz_1_1', type: 'quiz', level: 1, subject: 'math', title: 'Number Quiz 1', content_data: '[{"q": "How many apples?", "options":["1", "2", "3"], "answer":"2", "img": "https://placehold.co/100x100/A0E7E0/000?text=🍎🍎"}, {"q": "What is 1+1?", "options":["1", "2", "3"], "answer":"2"}]', next_content_id: 'lesson_2_1' },
  { id: 'lesson_2_1', type: 'lesson', level: 2, subject: 'literacy', title: 'Basic Words', content_data: '{"text": "Time to learn some basic words. Let\'s start with common objects!"}', next_content_id: 'quiz_2_1' },
  { id: 'quiz_2_1', type: 'quiz', level: 2, subject: 'literacy', title: 'Word Quiz 1', content_data: '[{"q": "What is this?", "options":["Cat", "Dog", "Bird"], "answer":"Cat", "img": "https://placehold.co/100x100/A0E7E0/000?text=🐈"}, {"q": "Spell \\"sun\\"", "options":["sun", "son", "san"], "answer":"sun"}]', next_content_id: null },
];


const DiagnosticQuiz = ({ navigate }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();

  useEffect(() => {
    setTimeout(() => {
      const diagQuestions = initialContent.filter(c => c.type === 'diagnostic_quiz');
      setQuestions(diagQuestions);
      setLoading(false);
    }, 500);
  }, []);

  const handleChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        score += 1;
      }
    });

    const totalQuestions = questions.length;
    const newProgressData = { ...user.progress_data, diagnostic_score: score, diagnostic_total: totalQuestions };
    let newLevel = user.current_level;

    if (totalQuestions > 0 && (score / totalQuestions) >= 0.5) {
      newLevel = 2;
    } else {
      newLevel = 1;
    }

    const updatedUser = {
      ...user,
      current_level: newLevel,
      progress_data: newProgressData,
    };

    try {
      await updateUser(updatedUser);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center text-gray-600 mt-10">Loading diagnostic quiz...</div>;
  if (error) return <div className="text-red-600 text-center mt-10">{error}</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-teal-700">Welcome! Let's find your starting point.</h2>
      <p className="text-gray-700 text-center mb-6">Answer a few questions to help us personalize your learning journey.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <p className="text-lg font-semibold mb-3">
              {index + 1}. {q.q}
            </p>
            <div className="space-y-2">
              {q.options.map((option, optIndex) => (
                <label key={optIndex} className="flex items-center text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value={option}
                    onChange={() => handleChange(q.id, option)}
                    checked={answers[q.id] === option}
                    className="form-radio h-5 w-5 text-teal-600"
                    required
                  />
                  <span className="ml-2 text-base">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Submit Quiz
        </button>
      </form>
    </div>
  );
};

export default DiagnosticQuiz;
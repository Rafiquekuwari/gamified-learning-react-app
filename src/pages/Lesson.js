import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { initialContent } from '../constants/contentData'; // Import initialContent

const Lesson = ({ navigate, currentPath }) => {
  const { user, updateUser } = useAuth(); // updateUser is a dependency
  const contentId = currentPath.split('/learn/')[1];
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for Drag & Drop
  const [dragDropAnswers, setDragDropAnswers] = useState({});
  const [dragDropFeedback, setDragDropFeedback] = useState('');

  // State for Fill-in-the-Blanks
  const [fillBlanksAnswers, setFillBlanksAnswers] = useState({});
  const [fillBlanksFeedback, setFillBlanksFeedback] = useState('');

  useEffect(() => {
    const fetchContent = () => {
      setTimeout(() => {
        const foundContent = initialContent.find(c =>
          c.id === contentId &&
          (c.type === 'lesson' || c.type === 'drag_drop' || c.type === 'fill_blanks')
        );

        // *** THIS IS THE FIX ***
        // Check against the subject-specific level instead of a global one.
        if (foundContent && user.subject_levels[foundContent.subject] >= foundContent.level) {
          setContent(foundContent);
          if (foundContent.skill_tags) {
            const updatedSkillProficiency = { ...user.progress_data.skillProficiency };
            foundContent.skill_tags.forEach(skill => {
              updatedSkillProficiency[skill] = Math.max(updatedSkillProficiency[skill] || 0, 0.6);
            });
            updateUser({ ...user, progress_data: { ...user.progress_data, skillProficiency: updatedSkillProficiency } });
          }
        } else {
          setError('Content not found or not unlocked.');
        }
        setLoading(false);
      }, 500);
    };
    fetchContent();
  }, [contentId, user, updateUser]);

  const handleNext = async () => {
    if (content && content.next_content_id) {
      const nextContent = initialContent.find(c => c.id === content.next_content_id);
      if (nextContent) {
        const updatedSubjectProgress = { ...user.progress_data.subjectProgress };
        updatedSubjectProgress[content.subject] = content.id;
        
        const updatedUser = {
          ...user,
          progress_data: {
            ...user.progress_data,
            subjectProgress: updatedSubjectProgress
          }
        };
        await updateUser(updatedUser);

        if (nextContent.type === 'quiz' || nextContent.type === 'boss_battle') {
          navigate(`/quiz/${nextContent.id}`);
        } else {
          navigate(`/learn/${nextContent.id}`);
        }
      } else {
        const updatedSubjectProgress = { ...user.progress_data.subjectProgress };
        updatedSubjectProgress[content.subject] = content.id;
        const updatedUser = {
          ...user,
          progress_data: {
            ...user.progress_data,
            subjectProgress: updatedSubjectProgress
          }
        };
        await updateUser(updatedUser);
        alert(`You've completed all content in ${content.subject} for Level ${content.level}!`);
        navigate('/');
      }
    } else {
      const updatedSubjectProgress = { ...user.progress_data.subjectProgress };
      updatedSubjectProgress[content.subject] = content.id;
      const updatedUser = {
        ...user,
        progress_data: {
          ...user.progress_data,
          subjectProgress: updatedSubjectProgress
        }
      };
      await updateUser(updatedUser);
      alert(`You've completed all content in ${content.subject} for Level ${content.level}!`);
      navigate('/');
    }
  };

  if (loading) return <div className="text-center text-gray-600 mt-10">Loading content...</div>;
  if (error) return <div className="text-red-600 text-center mt-10">{error}</div>;
  if (!content) return <div className="text-center text-gray-600 mt-10">No content available.</div>;

  const renderContent = () => {
    const contentData = JSON.parse(content.content_data);

    switch (content.type) {
      case 'lesson':
        return (
          <>
            <p className="text-gray-700 text-lg mb-8">{contentData.text}</p>
            {contentData.img && (
              <img src={contentData.img} alt="Lesson illustration" className="w-full max-w-sm mx-auto rounded-lg shadow-md mb-8" />
            )}
          </>
        );
      case 'drag_drop':
        const handleDragDropChange = (itemId, value) => {
          setDragDropAnswers(prev => ({ ...prev, [itemId]: value }));
        };

        const checkDragDrop = () => {
          let allCorrect = true;
          for (const dragId in contentData.matches) {
            const dropId = contentData.matches[dragId];
            const dropItem = contentData.items.find(item => item.id === dropId);
            if (!dropItem || dragDropAnswers[dragId]?.toLowerCase() !== dropItem.value.toLowerCase()) {
              allCorrect = false;
              break;
            }
          }
          if (allCorrect) {
            setDragDropFeedback('Excellent! All matches are correct!');
            if (content.skill_tags) {
              const updatedSkillProficiency = { ...user.progress_data.skillProficiency };
              content.skill_tags.forEach(skill => {
                updatedSkillProficiency[skill] = Math.max(updatedSkillProficiency[skill] || 0, 0.6);
              });
              updateUser({ ...user, progress_data: { ...user.progress_data, skillProficiency: updatedSkillProficiency } });
            }
            setTimeout(handleNext, 1500);
          } else {
            setDragDropFeedback('Not quite. Try again!');
          }
        };

        return (
          <>
            <p className="text-gray-700 text-lg mb-4">{contentData.instructions}</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {contentData.items.filter(item => item.type === 'drag').map(item => (
                <div key={item.id} className="bg-blue-100 p-3 rounded-lg text-center font-semibold">
                  {item.value}
                </div>
              ))}
              {contentData.items.filter(item => item.type === 'drop').map(item => (
                <div key={item.id} className="bg-green-100 p-3 rounded-lg text-center border-2 border-green-300">
                  <input
                    type="text"
                    placeholder={`Type for ${item.value}`}
                    className="w-full bg-transparent text-center focus:outline-none"
                    value={dragDropAnswers[item.id] || ''}
                    onChange={(e) => handleDragDropChange(item.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
            {dragDropFeedback && <p className={`text-center font-bold mb-4 ${dragDropFeedback.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}>{dragDropFeedback}</p>}
            <button onClick={checkDragDrop} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out">
              Check Matches
            </button>
          </>
        );
      case 'fill_blanks':
        const handleFillBlanksChange = (qIndex, value) => {
          setFillBlanksAnswers(prev => ({ ...prev, [qIndex]: value }));
        };

        const checkFillBlanks = () => {
          let allCorrect = true;
          contentData.questions.forEach((q, index) => {
            if (fillBlanksAnswers[index]?.toLowerCase() !== q.answer.toLowerCase()) {
              allCorrect = false;
            }
          });

          if (allCorrect) {
            setFillBlanksFeedback('Fantastic! All blanks filled correctly!');
            if (content.skill_tags) {
              const updatedSkillProficiency = { ...user.progress_data.skillProficiency };
              content.skill_tags.forEach(skill => {
                updatedSkillProficiency[skill] = Math.max(updatedSkillProficiency[skill] || 0, 0.6);
              });
              updateUser({ ...user, progress_data: { ...user.progress_data, skillProficiency: updatedSkillProficiency } });
            }
            setTimeout(handleNext, 1500);
          } else {
            setFillBlanksFeedback('Some blanks are incorrect. Try again!');
          }
        };

        return (
          <>
            <p className="text-gray-700 text-lg mb-4">{contentData.instructions}</p>
            <div className="space-y-4 mb-6">
              {contentData.questions.map((q, index) => (
                <div key={index} className="flex items-center flex-wrap bg-gray-100 p-4 rounded-lg">
                  <span className="mr-2">{q.sentence_parts[0]}</span>
                  <input
                    type="text"
                    className="border-b-2 border-blue-400 bg-transparent text-center focus:outline-none w-24 mx-1"
                    value={fillBlanksAnswers[index] || ''}
                    onChange={(e) => handleFillBlanksChange(index, e.target.value)}
                    placeholder="____"
                  />
                  <span className="ml-2">{q.sentence_parts[1]}</span>
                  {q.options && (
                    <div className="ml-4 text-sm text-gray-500">
                      (Options: {q.options.join(', ')})
                    </div>
                  )}
                </div>
              ))}
            </div>
            {fillBlanksFeedback && <p className={`text-center font-bold mb-4 ${fillBlanksFeedback.includes('correct') ? 'text-green-600' : 'text-red-600'}`}>{fillBlanksFeedback}</p>}
            <button onClick={checkFillBlanks} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out">
              Check Answers
            </button>
          </>
        );
      default:
        return <p>Unknown content type.</p>;
    }
  };


  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-teal-700">{content.title}</h2>
      {renderContent()}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Back to Dashboard
        </button>
        {(content.type === 'lesson') && (
          <button
            onClick={handleNext}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default Lesson;
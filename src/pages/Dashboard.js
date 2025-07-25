import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { initialContent } from '../constants/contentData'; // Import initialContent

const Dashboard = ({ navigate }) => {
  const { user, updateUser } = useAuth();

  // State to hold the text for the continue learning button
  const [continueButtonText, setContinueButtonText] = useState(`Continue Learning (Level ${user.current_level})`);

  // Effect to update button text when user.current_level or skill proficiency changes
  useEffect(() => {
    const currentLevelSkills = [...new Set(initialContent.filter(item => item.level === user.current_level).flatMap(item => item.skill_tags || []))];
    let allSkillsMastered = true;
    if (currentLevelSkills.length > 0) {
        for (const skill of currentLevelSkills) {
            if ((user.progress_data.skillProficiency[skill] || 0) < 0.75) {
                allSkillsMastered = false;
                break;
            }
        }
    } else {
        allSkillsMastered = true;
    }

    if (allSkillsMastered) {
        setContinueButtonText(`Advance to Level ${user.current_level + 1}`);
    } else {
        setContinueButtonText(`Continue Learning (Level ${user.current_level})`);
    }
  }, [user.current_level, user.progress_data.skillProficiency]); // Depend on user.current_level and skillProficiency


  if (!user) {
    return <div className="text-center text-gray-600 mt-10">Loading user data...</div>;
  }

  // Calculate subject progress
  const getSubjectProgress = (subject) => {
    const subjectContentItems = initialContent.filter(item => item.subject === subject && item.level > 0);
    const uniqueSkillsInSubject = [...new Set(subjectContentItems.flatMap(item => item.skill_tags || []))];

    if (uniqueSkillsInSubject.length === 0) {
      return 0; // No skills defined for this subject
    }

    let totalProficiency = 0;
    uniqueSkillsInSubject.forEach(skill => {
      totalProficiency += (user.progress_data.skillProficiency[skill] || 0);
    });

    return (totalProficiency / uniqueSkillsInSubject.length) * 100;
  };


  // Get last quiz result for a specific subject
  const getLastQuizResultForSubject = (subject) => {
    const result = user.progress_data.lastQuizResult?.[subject];
    if (result) {
      return `Level ${result.level}: Score: ${result.score} / ${result.total} (${(result.percentage * 100).toFixed(0)}%)`; // Use stored percentage and level
    }
    return "N/A";
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-teal-700">Welcome, {user.username}!</h2>
      <p className="text-lg mb-6">Your current points: <span className="font-semibold text-green-600">{user.points}</span></p>

      {/* Last Quiz Results per Subject */}
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Last Quiz Results:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {['math', 'literacy'].map(subject => ( // Only Math and Literacy
          <div key={subject} className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <h4 className="text-xl font-semibold mb-2 text-blue-700 capitalize">
                {subject} {getLastQuizResultForSubject(subject).startsWith('Level') ? '' : `Level ${user.current_level}`} {/* Display current level if no specific quiz result level */}
            </h4>
            <p className="text-lg">{getLastQuizResultForSubject(subject)}</p>
          </div>
        ))}
      </div>

      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Your Subject Progress:</h3>
      <div className="space-y-4 mb-6">
        {['math', 'literacy'].map(subject => ( // Only Math and Literacy
          <div key={subject} className="flex items-center">
            <span className="w-32 text-left text-sm font-medium text-gray-700 capitalize">{subject} Progress:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-purple-500 h-4 rounded-full text-xs font-medium text-white text-right pr-2 leading-none"
                style={{ width: `${getSubjectProgress(subject).toFixed(0)}%` }}
              >
                {getSubjectProgress(subject).toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Choose Your Learning Path:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Changed to 2 columns for Math/English */}
        {['math', 'literacy'].map(subject => ( // Only Math and Literacy for now
          <div key={subject} className="section-card p-6 flex flex-col items-center justify-center text-center">
            <h4 className="text-xl font-bold text-gray-800 mb-3 capitalize">{subject}</h4>
            <p className="text-gray-600 mb-4">Explore lessons and quizzes in {subject}.</p>
            <button
              onClick={async () => {
                let nextContentToNavigate = null;

                // Check for last completed content in this specific subject path
                const lastCompletedIdForSubject = user.progress_data.subjectProgress?.[subject];
                if (lastCompletedIdForSubject) {
                    const lastCompletedContent = initialContent.find(item => item.id === lastCompletedIdForSubject);
                    if (lastCompletedContent && lastCompletedContent.next_content_id) {
                        nextContentToNavigate = initialContent.find(item => item.id === lastCompletedContent.next_content_id);
                    }
                }

                // If no specific next content found (or subject not started yet)
                // then find the first content for this subject at the user's current overall level
                if (!nextContentToNavigate) {
                    nextContentToNavigate = initialContent.find(c =>
                        c.subject === subject &&
                        c.level === user.current_level &&
                        (c.type === 'lesson' || c.type === 'drag_drop' || c.type === 'fill_blanks' || c.type === 'quiz' || c.type === 'boss_battle')
                    );
                }

                // Fallback to level 1 for the subject if nothing found at current overall level
                if (!nextContentToNavigate) {
                    nextContentToNavigate = initialContent.find(c =>
                        c.subject === subject &&
                        c.level === 1 &&
                        (c.type === 'lesson' || c.type === 'drag_drop' || c.type === 'fill_blanks' || c.type === 'quiz' || c.type === 'boss_battle')
                    );
                }


                if (nextContentToNavigate) {
                    // Check if current overall level skills are mastered before navigating
                    const currentLevelSkills = [...new Set(initialContent.filter(item => item.level === user.current_level).flatMap(item => item.skill_tags || []))];
                    let allSkillsMasteredForCurrentOverallLevel = true;
                    if (currentLevelSkills.length > 0) {
                        for (const skill of currentLevelSkills) {
                            if ((user.progress_data.skillProficiency[skill] || 0) < 0.75) {
                                allSkillsMasteredForCurrentOverallLevel = false;
                                break;
                            }
                        }
                    } else {
                        allSkillsMasteredForCurrentOverallLevel = true; // Assume mastery if no skills defined for level
                    }

                    let targetLevel = user.current_level;
                    if (allSkillsMasteredForCurrentOverallLevel && nextContentToNavigate.level > user.current_level) {
                        targetLevel = nextContentToNavigate.level; // Advance overall level if skills mastered and content is higher level
                        const updatedUser = { ...user, current_level: targetLevel };
                        await updateUser(updatedUser); // Ensure global state is updated
                    }


                    if (nextContentToNavigate.type === 'quiz' || nextContentToNavigate.type === 'boss_battle') {
                      navigate(`/quiz/${nextContentToNavigate.id}`);
                    } else {
                      navigate(`/learn/${nextContentToNavigate.id}`);
                    }
                } else {
                  alert(`You've completed all available content for ${subject}. Check back later for more!`);
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out w-full"
            >
              Start/Continue {subject}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
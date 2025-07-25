import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PracticePage = ({ navigate, locationState }) => {
  const { user, updateUser } = useAuth();
  const skillsToPractice = locationState?.state?.skillsToPractice || [];
  const [currentProblem, setCurrentProblem] = useState(null);
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [problemCount, setProblemCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const generateProblem = (skill) => {
    let num1, num2, answer, qText;
    switch (skill) {
      case 'counting_1_10':
        num1 = Math.floor(Math.random() * 10) + 1;
        qText = `How many fingers on ${num1} hand${num1 > 1 ? 's' : ''}? (Assume 5 fingers per hand)`;
        answer = (num1 * 5).toString();
        return { q: qText, answer: answer, skill: skill };
      case 'number_recognition':
        const numToRecognize = Math.floor(Math.random() * 10) + 1;
        const words = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
        qText = `What is the number for "${words[numToRecognize - 1]}"?`;
        answer = numToRecognize.toString();
        return { q: qText, answer: answer, skill: skill };
      case 'addition_basic':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = (num1 + num2).toString();
        qText = `What is ${num1} + ${num2}?`;
        return { q: qText, answer: answer, skill: skill };
      case 'subtraction_basic':
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // Ensure num2 < num1
        answer = (num1 - num2).toString();
        qText = `What is ${num1} - ${num2}?`;
        return { q: qText, answer: answer, skill: skill };
      case 'multiplication_basic':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = (num1 * num2).toString();
        qText = `What is ${num1} x ${num2}?`;
        return { q: qText, answer: answer, skill: skill };
      case 'division_basic':
        num2 = Math.floor(Math.random() * 4) + 2; // Divisor from 2 to 5
        let multiplier = Math.floor(Math.random() * 5) + 2; // Multiplier from 2 to 6
        num1 = num2 * multiplier; // Ensure num1 is a multiple of num2
        answer = (num1 / num2).toString();
        qText = `What is ${num1} / ${num2}?`;
        return { q: qText, answer: answer, skill: skill };
      case 'spelling_basic':
          const spellWords = ['cat', 'dog', 'run', 'jump', 'big', 'red', 'blue', 'green'];
          const wordToSpell = spellWords[Math.floor(Math.random() * spellWords.length)];
          qText = `Spell the word: "${wordToSpell}"`;
          return { q: qText, answer: wordToSpell, skill: skill };
      case 'alphabet_recognition':
          const alphabet = 'ABCDEFGHIJKLM'; // Limit to easier letters
          const letterIndex = Math.floor(Math.random() * (alphabet.length - 1));
          const currentLetter = alphabet[letterIndex];
          const nextLetter = alphabet[letterIndex + 1];
          qText = `What letter comes after "${currentLetter}"?`;
          return { q: qText, answer: nextLetter, skill: skill };
      case 'word_problems_addition':
          num1 = Math.floor(Math.random() * 5) + 1;
          num2 = Math.floor(Math.random() * 5) + 1;
          qText = `You have ${num1} candies and get ${num2} more. How many do you have in total?`;
          answer = (num1 + num2).toString();
          return { q: qText, answer: answer, skill: skill };
      case 'word_problems_subtraction':
          num1 = Math.floor(Math.random() * 10) + 5;
          num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
          qText = `You had ${num1} cookies and ate ${num2}. How many are left?`;
          answer = (num1 - num2).toString();
          return { q: qText, answer: answer, skill: skill };
      case 'word_problems_multiplication':
          num1 = Math.floor(Math.random() * 3) + 2;
          num2 = Math.floor(Math.random() * 3) + 2;
          qText = `There are ${num1} bags with ${num2} apples each. How many apples in total?`;
          answer = (num1 * num2).toString();
          return { q: qText, answer: answer, skill: skill };
      case 'word_problems_division':
          num2 = Math.floor(Math.random() * 2) + 2; // Divisor 2 or 3
          num1 = num2 * (Math.floor(Math.random() * 4) + 2); // Result up to 12
          qText = `You have ${num1} toys to share equally among ${num2} friends. How many does each get?`;
          answer = (num1 / num2).toString();
          return { q: qText, answer: answer, skill: skill };
      case 'basic_vocabulary':
          const vocabWordsEasy = [
              {q: "What is a small, furry pet that says 'meow'?", a: "cat"},
              {q: "What is a large animal that says 'moo'?", a: "cow"},
              {q: "What do you use to write?", a: "pencil"}
          ];
          const vocabItem = vocabWordsEasy[Math.floor(Math.random() * vocabWordsEasy.length)];
          return { q: vocabItem.q, answer: vocabItem.a, skill: skill };
      case 'opposites':
          const oppositePairsEasy = [
              {q: "What is the opposite of 'day'?", a: "night"},
              {q: "What is the opposite of 'open'?", a: "close"},
              {q: "What is the opposite of 'happy'?", a: "sad"}
          ];
          const oppItem = oppositePairsEasy[Math.floor(Math.random() * oppositePairsEasy.length)];
          return { q: oppItem.q, answer: oppItem.a, skill: skill };
      case 'basic_grammar':
          const basicGrammarQuestions = [
              {q: "Which word is a naming word (noun): 'jump' or 'book'?", a: "book"},
              {q: "Which word is an action word (verb): 'sleep' or 'chair'?", a: "sleep"},
              {q: "Fill in the blank: I ___ a boy. (am/is/are)", a: "am"}
          ];
          const basicGrammarItem = basicGrammarQuestions[Math.floor(Math.random() * basicGrammarQuestions.length)];
          return { q: basicGrammarItem.q, answer: basicGrammarItem.a, skill: skill };
      case 'nouns':
          const nounQuestions = [
              {q: "Is 'flower' a person, place, or thing?", a: "thing"},
              {q: "Is 'park' a person, place, or thing?", a: "place"},
          ];
          const nounItem = nounQuestions[Math.floor(Math.random() * nounQuestions.length)];
          return { q: nounItem.q, answer: nounItem.a, skill: nounItem.skill || skill };
      case 'verbs':
          const verbQuestions = [
              {q: "Which word shows action: 'sing' or 'song'?", a: "sing"},
              {q: "Which word tells what you do: 'read' or 'red'?", a: "read"},
          ];
          const verbItem = verbQuestions[Math.floor(Math.random() * verbQuestions.length)];
          return { q: verbItem.q, answer: verbItem.a, skill: verbItem.skill || skill };
      case 'verb_tenses':
          const verbTenseQuestions = [
              {q: "Complete: Today, I ___ (eat) an apple.", a: "eat"},
              {q: "Complete: Tomorrow, I ___ (play) outside.", a: "will play"},
          ];
          const verbTenseItem = verbTenseQuestions[Math.floor(Math.random() * verbTenseQuestions.length)];
          return { q: verbTenseItem.q, answer: verbTenseItem.a, skill: verbTenseItem.skill || skill };
      case 'adjectives':
          const adjectiveQuestions = [
              {q: "Which word describes a color: 'run' or 'green'?", a: "green"},
              {q: "Which word describes how something feels: 'soft' or 'sleep'?", a: "soft"},
          ];
          const adjectiveItem = adjectiveQuestions[Math.floor(Math.random() * adjectiveQuestions.length)];
          return { q: adjectiveItem.q, answer: adjectiveItem.a, skill: adjectiveItem.skill || skill };
      case 'adverbs':
          const adverbQuestions = [
              {q: "Which word tells 'how' you do something: 'loud' or 'loudly'?", a: "loudly"},
              {q: "He walks ___. (Choose the word that tells how: quick/quickly)", a: "quickly"},
          ];
          const adverbItem = adverbQuestions[Math.floor(Math.random() * adverbQuestions.length)];
          return { q: adverbItem.q, answer: adverbItem.a, skill: adverbItem.skill || skill };
      case 'sentence_completion':
          const sentenceCompletionQuestions = [
              {q: "The cat sat ___ the mat. (on/in)", a: "on"},
              {q: "I like ___ play. (to/too)", a: "to"},
          ];
          const sentenceCompletionItem = sentenceCompletionQuestions[Math.floor(Math.random() * sentenceCompletionQuestions.length)];
          return { q: sentenceCompletionItem.q, answer: sentenceCompletionItem.a, skill: sentenceCompletionItem.skill || skill };
      case 'sentence_expansion':
          const sentenceExpansionQuestions = [
              {q: "Add a describing word: The ___ dog ran. (big/runs)", a: "big"},
              {q: "Add a word that tells how: She sings ___.", a: "loudly"},
          ];
          const sentenceExpansionItem = sentenceExpansionQuestions[Math.floor(Math.random() * sentenceExpansionQuestions.length)];
          return { q: sentenceExpansionItem.q, answer: sentenceExpansionItem.a, skill: sentenceExpansionItem.skill || skill };
      case 'grammar_intermediate':
          const intermediateGrammarQuestions = [
              {q: "Which is correct: 'He go' or 'He goes'?", a: "He goes"},
              {q: "What is the plural of 'cat'?", a: "cats"},
          ];
          const intermediateGrammarItem = intermediateGrammarQuestions[Math.floor(Math.random() * intermediateGrammarQuestions.length)];
          return { q: intermediateGrammarItem.q, answer: intermediateGrammarItem.a, skill: intermediateGrammarItem.skill || skill };
      case 'phonics_basic':
          const phonicsQuestions = [
              {q: "What sound does 'a' make in 'apple'?", a: "ah"},
              {q: "What sound does 'b' make in 'ball'?", a: "buh"},
          ];
          const phonicsItem = phonicsQuestions[Math.floor(Math.random() * phonicsQuestions.length)];
          return { q: phonicsItem.q, answer: phonicsItem.a, skill: phonicsItem.skill || skill };

      default:
        // For skills not specifically handled, provide a more informative generic message
        return {
          q: `Practice for "${skill.replace(/_/g, ' ')}" is best done through interactive lessons and quizzes. Please return to the dashboard to continue learning this concept.`,
          answer: "N/A", // Indicate no direct answer for typing
          skill: skill
        };
    }
  };

  useEffect(() => {
    if (skillsToPractice.length > 0) {
      // Pick a random skill from the ones needing practice
      const randomSkill = skillsToPractice[Math.floor(Math.random() * skillsToPractice.length)];
      setCurrentProblem(generateProblem(randomSkill));
    } else {
      setFeedback('No specific skills to practice. Returning to dashboard.');
      setTimeout(() => navigate('/'), 1500);
    }
  }, [skillsToPractice, problemCount]); // Re-generate problem when problemCount changes

  const handleSubmitPractice = async () => {
    if (!currentProblem || currentProblem.answer === "N/A") { // Prevent submission for generic problems
        setFeedback("This problem type doesn't require a typed answer. Please return to dashboard.");
        return;
    }

    let newPoints = user.points;
    let isCorrect = false;

    if (answerInput.toLowerCase() === currentProblem.answer.toLowerCase()) {
      isCorrect = true;
      newPoints += 1; // Award 1 point for correct answer in practice
      setCorrectCount(prev => prev + 1);
      setFeedback('Correct! Keep going!');
    } else {
      setFeedback(`Incorrect. The answer was "${currentProblem.answer}".`);
    }

    // Update skill proficiency after each practice problem
    const updatedSkillProficiency = { ...user.progress_data.skillProficiency };
    const skill = currentProblem.skill;
    const currentProficiency = updatedSkillProficiency[skill] !== undefined ? updatedSkillProficiency[skill] : 0; // Initialize to 0 if not set
    if (isCorrect) {
        updatedSkillProficiency[skill] = Math.min(1, currentProficiency + 0.10); // Boost by 10% for correct practice
    } else {
        updatedSkillProficiency[skill] = Math.max(0, currentProficiency - 0.10); // Drop by 10% for incorrect practice
    }

    const updatedUser = {
        ...user,
        points: newPoints,
        progress_data: {
            ...user.progress_data,
            skillProficiency: updatedSkillProficiency
        }
    };
    await updateUser(updatedUser);

    setTimeout(() => {
      setFeedback('');
      setAnswerInput('');
      setProblemCount(prev => prev + 1); // Trigger new problem generation
    }, 1500);
  };

  if (!currentProblem) return <div className="text-center text-gray-600 mt-10">Loading practice problems...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg text-center">
      <h2 className="text-3xl font-bold mb-6 text-teal-700">Practice Time!</h2>
      <p className="text-lg mb-4">Let's work on your {currentProblem.skill.replace(/_/g, ' ')} skills.</p>
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
        <p className="text-2xl font-semibold mb-4">{currentProblem.q}</p>
        {currentProblem.answer !== "N/A" && ( // Only show input field if an answer is expected
          <input
            type="text"
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-center text-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Your answer"
            onKeyPress={(e) => { if (e.key === 'Enter') handleSubmitPractice(); }}
          />
        )}
      </div>
      {feedback && <p className={`text-center font-bold mb-4 ${feedback.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
      <button
        onClick={handleSubmitPractice}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
      >
        Check Answer
      </button>

      <div className="flex justify-center mt-8"> {/* Changed to justify-center */}
        <button
          onClick={() => navigate('/')}
          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PracticePage;
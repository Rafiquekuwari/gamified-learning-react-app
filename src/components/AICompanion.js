import React, { useState, useEffect, useRef } from 'react';

const AICompanion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi there! I am your learning buddy. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    // Basic AI response logic (simulated)
    let botResponse = '';
    const lowerInput = userMessage.text.toLowerCase();

    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      botResponse = 'Hello! Ready to learn something new?';
    } else if (lowerInput.includes('help') || lowerInput.includes('stuck')) {
      botResponse = 'Don\'t worry! What are you finding difficult? I can give you a hint or explain the concept again.';
    } else if (lowerInput.includes('points') || lowerInput.includes('level')) {
      botResponse = 'Keep learning and completing quizzes to earn more points and level up!';
    } else {
      botResponse = 'That\'s interesting! Let\'s focus on our lessons. What topic are you working on?';
    }

    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        <span className="text-xl">🤖</span>
        {isOpen ? '' : <span className="ml-2">Buddy</span>}
      </button>

      {isOpen && (
        <div className="bg-white rounded-xl shadow-xl w-80 h-96 flex flex-col mt-2">
          <div className="bg-purple-500 text-white p-3 rounded-t-xl flex justify-between items-center">
            <h3 className="font-bold text-lg">Learning Buddy</h3>
            <button onClick={() => setIsOpen(false)} className="text-white text-xl font-bold">&times;</button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] p-2 rounded-lg text-sm ${
                    msg.sender === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="submit"
              className="ml-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AICompanion;
import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const ChatWidget = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm ForestWatch Assistant. How can I help you with forest monitoring today?", isUser: false }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    // Add user message
    const userMessage = { id: Date.now(), text: newMessage, isUser: true };
    setMessages([...messages, userMessage]);
    setNewMessage('');
    
    // Simulate response (in a real app, this would call an API)
    setTimeout(() => {
      const botResponses = {
        'hello': "Hi there! How can I help you with forest monitoring?",
        'forest': "Forests are crucial ecosystems that provide habitat for biodiversity, regulate climate, and support human livelihoods.",
        'data': "Our data comes from satellite imagery and is updated regularly to track forest cover changes.",
        'help': "You can use our dashboard to view forest cover data by state or district, and analyze trends over time."
      };
      
      let botReply = "I'm not sure how to respond to that. Try asking about forest data, monitoring, or how to use our dashboard.";
      
      // Simple keyword matching
      for (const [keyword, response] of Object.entries(botResponses)) {
        if (newMessage.toLowerCase().includes(keyword)) {
          botReply = response;
          break;
        }
      }
      
      const botMessage = { id: Date.now() + 1, text: botReply, isUser: false };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden">
      <div className="bg-green-700 text-white p-3 flex justify-between items-center">
        <h3 className="font-medium">ForestWatch Assistant</h3>
        <button onClick={onClose} className="text-white hover:text-green-200">
          <X size={18} />
        </button>
      </div>
      
      <div className="flex-grow p-3 overflow-y-auto">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`mb-3 ${message.isUser ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block px-3 py-2 rounded-lg ${
                message.isUser 
                  ? 'bg-green-600 text-white rounded-br-none' 
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t p-3 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <button 
          type="submit"
          className="bg-green-600 text-white px-3 py-2 rounded-r-lg hover:bg-green-700"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const ChatWidget = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm ForestWatch Assistant. How can I help you with forest monitoring today?", isUser: false }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessageToBackend = async (message) => {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.text();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    // Add user message
    const userMessage = { id: Date.now(), text: newMessage, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      // Get response from backend
      const botReply = await sendMessageToBackend(newMessage);
      
      const botMessage = { 
        id: Date.now() + 1, 
        text: botReply, 
        isUser: false 
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        id: Date.now() + 1, 
        text: "I'm sorry, I encountered an error. Please try again.", 
        isUser: false 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-96 h-[32rem] bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden">
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
              className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                message.isUser 
                  ? 'bg-green-600 text-white rounded-br-none' 
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-gray-500">
            <div className="animate-pulse">Thinking...</div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t p-3 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-green-500"
          disabled={isLoading}
        />
        <button 
          type="submit"
          className={`${
            isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
          } text-white px-3 py-2 rounded-r-lg transition-colors`}
          disabled={isLoading}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
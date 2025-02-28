import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

interface ChatWidgetProps {
  onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm ForestWatch Assistant. How can I help you with forest monitoring today?", isUser: false }
  ]);
  const [newMessage, setNewMessage] = useState<string>('');

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const userMessage: Message = { id: Date.now(), text: newMessage, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');

    setTimeout(() => {
      const botResponses: Record<string, string> = {
        'hello': "Hi there! How can I help you with forest monitoring?",
        'forest': "Forests are crucial ecosystems that provide habitat for biodiversity, regulate climate, and support human livelihoods.",
        'data': "Our data comes from satellite imagery and is updated regularly to track forest cover changes.",
        'help': "You can use our dashboard to view forest cover data by state or district, and analyze trends over time."
      };

      let botReply = "I'm not sure how to respond to that. Try asking about forest data, monitoring, or how to use our dashboard.";

      for (const [keyword, response] of Object.entries(botResponses)) {
        if (newMessage.toLowerCase().includes(keyword)) {
          botReply = response;
          break;
        }
      }

      const botMessage: Message = { id: Date.now() + 1, text: botReply, isUser: false };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 h-96 bg-black rounded-lg shadow-xl flex flex-col z-50 overflow-hidden">
      <div className="bg-purple-700 text-white p-3 flex justify-between items-center">
        <h3 className="font-medium">ForestWatch Assistant</h3>
        <button onClick={onClose} className="text-white hover:text-purple-300">
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
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-200 rounded-bl-none'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-gray-700 p-3 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-3 py-2 rounded-r-lg hover:bg-purple-700"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
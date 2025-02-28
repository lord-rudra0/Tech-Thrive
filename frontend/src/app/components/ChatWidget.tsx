import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
}

interface ForestData {
  location: string;
  location_type: string;
  density_threshold: number;
  stats: {
    carbon_density: { value: number; formatted: string };
    carbon_stocks: { value: number; formatted: string };
    tree_cover_area: { value: number; formatted: string };
    tree_cover_extent: { [key: string]: { value: number; formatted: string } };
    tree_cover_gain_2000_2020: { value: number; formatted: string };
  };
  yearly_data: {
    emissions: { [key: string]: { value: number; formatted: string } };
    tree_loss: { [key: string]: { value: number; formatted: string } };
  };
  analysis: {
    forest_health_status: string;
    net_forest_change: { value: number; formatted: string; percent: number };
    total_emissions: { value: number; formatted: string };
    total_loss: { value: number; formatted: string };
  };
}

interface ChatWidgetProps {
  onClose: () => void;
  initialAnalysis: string | null;
  forestData: ForestData;
  location: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  onClose,
  initialAnalysis,
  forestData,
  location
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set initial messages when analysis is received
  useEffect(() => {
    if (initialAnalysis) {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your Forest Analysis Assistant. I've analyzed the forest data for your selected location.",
          isUser: false
        },
        {
          id: 2,
          text: initialAnalysis,
          isUser: false
        },
        {
          id: 3,
          text: "You can ask me questions about this data or forest conservation in general. How can I help you?",
          isUser: false
        }
      ]);
    }
  }, [initialAnalysis]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          context: {
            location,
            forestData
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.response,
        isUser: false
      }]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error('Chat error:', errorMessage);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg w-96 max-w-full border border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Forest Analysis Assistant</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className={`px-4 py-2 rounded-lg font-medium ${
              isLoading || !newMessage.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWidget; 
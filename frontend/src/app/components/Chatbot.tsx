"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';

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

interface ChatbotProps {
  forestData?: ForestData;
  location?: string;
  initialAnalysis?: string;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const FloatingChatbot: React.FC<ChatbotProps> = ({ forestData, location, initialAnalysis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set initial messages when analysis is received
  useEffect(() => {
    if (initialAnalysis && forestData) {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm ForestWatch Assistant. I've analyzed the forest data for your selected location.",
          sender: "bot"
        },
        {
          id: 2,
          text: initialAnalysis,
          sender: "bot"
        },
        {
          id: 3,
          text: "You can ask me any questions about this data or forest conservation in general. How can I help you?",
          sender: "bot"
        }
      ]);
    } else {
      setMessages([
        { 
          id: 1, 
          text: "Hi there! How can I help you today?", 
          sender: "bot" 
        }
      ]);
    }
  }, [initialAnalysis, forestData]);

  const sendMessageToBackend = async (message: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          context: forestData ? {
            location,
            forestData: {
              stats: forestData.stats,
              yearly_data: forestData.yearly_data,
              analysis: forestData.analysis
            }
          } : null
        }),
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '' || isLoading) return;
    
    // Add user message
    const userMessage: Message = { 
      id: Date.now(), 
      text: inputValue, 
      sender: "user" 
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Get response from backend
      const botReply = await sendMessageToBackend(userInput);
      
      const botMessage: Message = { 
        id: Date.now() + 1, 
        text: botReply, 
        sender: "bot" 
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { 
        id: Date.now() + 1, 
        text: "I'm sorry, I encountered an error. Please try again.", 
        sender: "bot" 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForestDataAnalysis = async () => {
    if (!forestData) {
      const noDataMessage: Message = {
        id: Date.now(),
        text: "No forest data available for analysis. Please select a location first.",
        sender: "bot"
      };
      setMessages(prev => [...prev, noDataMessage]);
      return;
    }

    setIsLoading(true);
    
    const analysisRequestMsg: Message = { 
      id: Date.now(), 
      text: "Analyzing forest data...", 
      sender: "user" 
    };
    
    setMessages([...messages, analysisRequestMsg]);
    
    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location,
          forestData: {
            stats: forestData.stats,
            yearly_data: forestData.yearly_data,
            analysis: forestData.analysis
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (!data || !data.analysis) {
        throw new Error('Invalid response format from server');
      }
      
      // Add analysis response
      const analysisResponse: Message = { 
        id: Date.now(), 
        text: data.analysis, 
        sender: "bot" 
      };
      
      setMessages(prevMessages => [...prevMessages, analysisResponse]);
    } catch (error) {
      console.error('Analysis error:', error);
      const errorResponse: Message = { 
        id: Date.now(), 
        text: "Sorry, there was an error analyzing the forest data. Please try again.", 
        sender: "bot" 
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gray-800 rounded-lg shadow-lg w-96 max-w-full border border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between border-b border-gray-700">
              <h3 className="font-medium">ForestWatch Assistant</h3>
              <div className="flex space-x-2">
                {forestData && (
                  <button 
                    onClick={handleForestDataAnalysis} 
                    className="p-1 px-2 rounded bg-purple-600 hover:bg-purple-700 transition-colors text-xs"
                    disabled={isLoading}
                  >
                    Analyze Forest Data
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Messages area */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-300">Analyzing...</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me about the forest data..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                  type="submit"
                  disabled={inputValue.trim() === '' || isLoading}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    inputValue.trim() === '' || isLoading
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            key="chat-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-colors"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingChatbot;
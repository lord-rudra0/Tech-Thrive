import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ChatWidget from './components/ChatWidget';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [densities, setDensities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch available locations
    fetch('/api/available-locations')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Make sure data is an array before setting it
        const locations = Array.isArray(data) ? data : [];
        setAvailableLocations(locations);
        // Fetch densities for the first location if available
        if (locations.length > 0) {
          fetchDensities(locations[0]);
        }
      })
      .catch(error => {
        console.error('Error fetching locations:', error);
        setAvailableLocations([]);  // Set empty array on error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const fetchDensities = (location) => {
    fetch(`/api/densities?location=${location}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.densities) {
          setDensities(data.densities);
        }
      })
      .catch(error => console.error('Error fetching densities:', error));
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home locations={availableLocations} />} />
            <Route path="/dashboard" element={<Dashboard locations={availableLocations} densities={densities} />} />
          </Routes>
        </main>
        <Footer densities={densities} />
        
        {/* Chat Icon */}
        <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={toggleChat}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
          >
            <MessageCircle size={24} />
          </button>
        </div>
        
        {/* Chat Widget */}
        {isChatOpen && <ChatWidget onClose={toggleChat} />}
      </div>
    </Router>
  );
}

export default App;
import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { useLocation } from 'react-router-dom';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { MapPin, AlertCircle, Search, X } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title, 
  Tooltip, 
  Legend
);

// Define the allowed states
const STATES = [
  "andaman and nicobar",
  "andhra pradesh",
  "arunachal pradesh",
  "assam",
  "bihar",
  "chandigarh",
  "chhattisgarh",
  "dadra and nagar haveli",
  "daman and diu",
  "goa",
  "gujarat",
  "haryana",
  "himachal pradesh",
  "jammu and kashmir",
  "jharkhand",
  "karnataka",
  "kerala",
  "lakshadweep",
  "madhya pradesh",
  "maharashtra",
  "manipur",
  "meghalaya",
  "mizoram",
  "nagaland",
  "nct of delhi",
  "odisha",
  "puducherry",
  "punjab",
  "rajasthan",
  "sikkim",
  "tamil nadu",
  "telangana",
  "tripura",
  "uttar pradesh",
  "uttarakhand",
  "west bengal"
];

const DENSITIES = [0, 10, 15, 20, 25, 30, 50, 75];

const Dashboard = ({ locations, densities }) => {
  const routeLocation = useLocation();
  const [locationType, setLocationType] = useState('state');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDensity, setSelectedDensity] = useState('');
  const [forestData, setForestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showChat, setShowChat] = useState(false);
  const [initialAnalysis, setInitialAnalysis] = useState(null);

  // Remove automatic density selection
  useEffect(() => {
    if (routeLocation.state?.selectedLocation) {
      setSelectedLocation(routeLocation.state.selectedLocation);
    }
  }, [routeLocation.state]);

  // Remove automatic data fetching on selection change
  useEffect(() => {
    if (locationType === 'district') {
      fetchDistricts();
    }
  }, [locationType]);

  // Fetch districts from the API
  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/available-locations');
      const data = await response.json();
      if (data && data.districts) {
        setDistricts(data.districts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredLocations = () => {
    const locations = locationType === 'state' ? STATES : districts;
    if (!searchTerm) return locations;
    return locations.filter(location =>
      location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSearchTerm(location);
    setIsDropdownOpen(false);
  };

  const clearSelection = () => {
    setSelectedLocation('');
    setSearchTerm('');
    setIsDropdownOpen(true);
  };

  const fetchData = async () => {
    if (!selectedLocation || !selectedDensity) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = locationType === 'state' 
        ? `/api/state/${selectedLocation}/${selectedDensity}`
        : `/api/district/${selectedLocation}/${selectedDensity}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setForestData(data);

      // Get AI analysis for the chat
      const analysisResponse = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: selectedLocation,
          stats: data.stats,
          yearly_data: data.yearly_data,
          analysis: data.analysis
        }),
      });

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setInitialAnalysis(analysisData.analysis);
        setShowChat(true);
      }
    } catch (err) {
      console.error('Error fetching forest data:', err);
      setError('Failed to load forest data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      setError('Please select a location');
      return;
    }
    
    if (!selectedDensity) {
      setError('Please select a density threshold');
      return;
    }
    
    fetchData();
  };

  const filteredLocations = getFilteredLocations();

  // Prepare chart data for emissions
  const emissionsChartData = forestData?.yearly_data?.emissions ? {
    labels: Object.keys(forestData.yearly_data.emissions),
    datasets: [
      {
        label: 'CO₂ Emissions (Mg)',
        data: Object.values(forestData.yearly_data.emissions).map(item => item.value),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  } : null;

  // Prepare chart data for tree loss
  const treeLossChartData = forestData?.yearly_data?.tree_loss ? {
    labels: Object.keys(forestData.yearly_data.tree_loss),
    datasets: [
      {
        label: 'Tree Loss (hectares)',
        data: Object.values(forestData.yearly_data.tree_loss).map(item => item.value),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  } : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Forest Monitoring Dashboard</h1>
      
      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Type
            </label>
            <select
              value={locationType}
              onChange={(e) => {
                setLocationType(e.target.value);
                setSelectedLocation('');
                setSearchTerm('');
                setForestData(null); // Clear existing data
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="state">State</option>
              <option value="district">District</option>
            </select>
          </div>

          {/* Location Selector */}
          <div ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locationType === 'state' ? 'State' : 'District'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onClick={() => setIsDropdownOpen(true)}
                placeholder={`Search ${locationType}...`}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 pr-10"
              />
              {selectedLocation && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {/* Location Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {getFilteredLocations().map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Density Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Density Threshold
            </label>
            <select
              value={selectedDensity}
              onChange={(e) => setSelectedDensity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Density</option>
              {DENSITIES.map((density) => (
                <option key={density} value={density}>
                  {density}%
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <AlertCircle size={18} className="mr-2" />
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full md:w-auto px-6 py-2 rounded-md text-white font-medium
              ${loading 
                ? 'bg-green-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>
      </form>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
      
      {/* Dashboard Content */}
      {forestData && !loading && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Location</h3>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-2xl font-bold capitalize">{forestData.location}</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">Type: {forestData.location_type}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Forest Health</h3>
              <p className={`text-2xl font-bold ${
                forestData.analysis.forest_health_status === 'Decline' 
                  ? 'text-red-600' 
                  : forestData.analysis.forest_health_status === 'Stable'
                    ? 'text-yellow-600'
                    : 'text-green-600'
              }`}>
                {forestData.analysis.forest_health_status}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Net change: {forestData.analysis.net_forest_change.formatted} ({forestData.analysis.net_forest_change.percent}%)
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Emissions</h3>
              <p className="text-2xl font-bold text-gray-900">
                {forestData.analysis.total_emissions.formatted}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Carbon density: {forestData.stats.carbon_density.formatted}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tree Cover</h3>
              <p className="text-2xl font-bold text-gray-900">
                {forestData.stats.tree_cover_area.formatted}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Total loss: {forestData.analysis.total_loss.formatted}
              </p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {emissionsChartData && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">CO₂ Emissions Over Time</h3>
                <div className="h-80">
                  <Line 
                    data={emissionsChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Emissions (Mg CO₂e)'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Year'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
            
            {treeLossChartData && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Tree Cover Loss by Year</h3>
                <div className="h-80">
                  <Bar 
                    data={treeLossChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Area (hectares)'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Year'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Additional Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Additional Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">Carbon Stocks</h4>
                <p className="text-xl font-semibold mt-1">{forestData.stats.carbon_stocks.formatted}</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">Tree Cover (2000)</h4>
                <p className="text-xl font-semibold mt-1">{forestData.stats.tree_cover_extent["2000"].formatted}</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">Tree Cover (2010)</h4>
                <p className="text-xl font-semibold mt-1">{forestData.stats.tree_cover_extent["2010"].formatted}</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">Tree Cover Gain (2000-2020)</h4>
                <p className="text-xl font-semibold mt-1">{forestData.stats.tree_cover_gain_2000_2020.formatted}</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">Density Threshold</h4>
                <p className="text-xl font-semibold mt-1">{forestData.density_threshold}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add ChatWidget */}
      {showChat && (
        <ChatWidget 
          onClose={() => setShowChat(false)}
          initialAnalysis={initialAnalysis}
          forestData={forestData}
          location={selectedLocation}
        />
      )}
    </div>
  );
};

export default Dashboard;
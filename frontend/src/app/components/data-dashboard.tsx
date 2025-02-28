
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { useSearchParams } from 'next/navigation';
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
const STATES: string[] = [
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

const DENSITIES: number[] = [0, 10, 15, 20, 25, 30, 50, 75];

// TypeScript interfaces
interface DashboardProps {
  locations?: string[];
  densities?: number[];
}

interface FormattedValue {
  value: number;
  formatted: string;
  unit?: string;
  percent?: number;
}

interface TreeCoverExtent {
  [year: string]: FormattedValue;
}

interface YearlyDataValue {
  value: number;
  formatted: string;
}

interface YearlyData {
  [year: string]: YearlyDataValue;
}

interface YearlyDataCategory {
  emissions: YearlyData;
  tree_loss: YearlyData;
}

interface ForestStats {
  carbon_density: FormattedValue;
  carbon_stocks: FormattedValue;
  tree_cover_area: FormattedValue;
  tree_cover_extent: TreeCoverExtent;
  tree_cover_gain_2000_2020: FormattedValue;
}

interface ForestAnalysis {
  forest_health_status: string;
  net_forest_change: FormattedValue;
  total_emissions: FormattedValue;
  total_loss: FormattedValue;
}

interface ForestData {
  location: string;
  location_type: string;
  density_threshold: number;
  stats: ForestStats;
  analysis: ForestAnalysis;
  yearly_data: YearlyDataCategory;
}

const Dashboard: React.FC<DashboardProps> = ({ locations, densities }) => {
  const searchParams = useSearchParams();
  const [locationType, setLocationType] = useState<string>('state');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDensity, setSelectedDensity] = useState<number>(30);
  const [forestData, setForestData] = useState<ForestData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [districts, setDistricts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if a location was passed via URL params
  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setSelectedLocation(locationParam);
      setSearchTerm(locationParam);
    } else if (locations && locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0]);
    }
  }, [locations, searchParams]);

  useEffect(() => {
    if (densities && densities.length > 0 && !selectedDensity) {
      setSelectedDensity(densities[0]);
    }
  }, [densities]);

  // Fetch districts when locationType changes to 'district'
  useEffect(() => {
    if (locationType === 'district') {
      fetchDistricts();
    }
  }, [locationType]);

  // Fetch districts from the API
  const fetchDistricts = async (): Promise<void> => {
    try {
      const response = await fetch('https://tech-thrive.onrender.com/data/available-locations');
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
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredLocations = (): string[] => {
    const locationsArray = locationType === 'state' ? STATES : districts;
    if (!searchTerm) return locationsArray;
    return locationsArray.filter(location =>
      location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleLocationSelect = (location: string): void => {
    setSelectedLocation(location);
    setSearchTerm(location);
    setIsDropdownOpen(false);
  };

  const clearSelection = (): void => {
    setSelectedLocation('');
    setSearchTerm('');
    setIsDropdownOpen(true);
  };

  const fetchData = async (): Promise<void> => {
    if (!selectedLocation || !selectedDensity) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = locationType === 'state' 
        ? `https://tech-thrive.onrender.com/data/state/${selectedLocation}/${selectedDensity}`
        : `https://tech-thrive.onrender.com/data/district/${selectedLocation}/${selectedDensity}`;
        
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setForestData(data);
    } catch (err) {
      console.error('Error fetching forest data:', err);
      setError('Failed to load forest data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLocation && selectedDensity) {
      fetchData();
    }
  }, [selectedLocation, selectedDensity, locationType]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
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
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
      }
    ]
  } : null;

  // Chart options with dark theme
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Emissions (Mg CO₂e)',
          color: '#e2e8f0'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: '#e2e8f0'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Year',
          color: '#e2e8f0'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: '#e2e8f0'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0'
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-[#0a0a0a] text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-purple-300">Forest Monitoring</h1>
      
      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="bg-[#0a0a0a] p-6 rounded-lg shadow-md mb-8 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Location Type
            </label>
            <select
              value={locationType}
              onChange={(e) => {
                setLocationType(e.target.value);
                setSelectedLocation('');
                setSearchTerm('');
              }}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-purple-700 focus:border-purple-500"
            >
              <option value="state">State</option>
              <option value="district">District</option>
            </select>
          </div>

          {/* Searchable Location Dropdown */}
          <div ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {locationType === 'state' ? 'State' : 'District'}
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                    if (e.target.value !== selectedLocation) {
                      setSelectedLocation('');
                    }
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder={`Search ${locationType}...`}
                  className="w-full p-2 pr-20 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-purple-700 focus:border-purple-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="p-1 text-gray-300 hover:text-gray-100"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <Search size={16} className="text-gray-300 ml-1" />
                </div>
              </div>

              {/* Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {getFilteredLocations().length > 0 ? (
                    getFilteredLocations().map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => handleLocationSelect(location)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${
                          selectedLocation === location ? 'bg-gray-600' : ''
                        }`}
                      >
                        {location.charAt(0).toUpperCase() + location.slice(1)}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-400">
                      No {locationType}s found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Density Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Density Threshold (%)
            </label>
            <select
              value={selectedDensity}
              onChange={(e) => setSelectedDensity(Number(e.target.value))}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-purple-700 focus:border-purple-500"
            >
              {DENSITIES.map((density) => (
                <option key={density} value={density}>
                  {density}%
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            disabled={loading || !selectedLocation}
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>
      </form>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-300" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
      
      {/* Dashboard Content */}
      {forestData && !loading && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Location</h3>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-purple-400 mr-2" />
                <p className="text-2xl font-bold capitalize text-white">{forestData.location}</p>
              </div>
              <p className="text-sm text-gray-400 mt-2">Type: {forestData.location_type}</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Forest Health</h3>
              <p className={`text-2xl font-bold ${
                forestData.analysis.forest_health_status === 'Decline' 
                  ? 'text-red-400' 
                  : forestData.analysis.forest_health_status === 'Stable'
                    ? 'text-yellow-400'
                    : 'text-purple-400'
              }`}>
                {forestData.analysis.forest_health_status}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Net change: {forestData.analysis.net_forest_change.formatted} ({forestData.analysis.net_forest_change.percent}%)
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Emissions</h3>
              <p className="text-2xl font-bold text-white">
                {forestData.analysis.total_emissions.formatted}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Carbon density: {forestData.stats.carbon_density.formatted}
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Tree Cover</h3>
              <p className="text-2xl font-bold text-white">
                {forestData.stats.tree_cover_area.formatted}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Total loss: {forestData.analysis.total_loss.formatted}
              </p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {emissionsChartData && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">CO₂ Emissions Over Time</h3>
                <div className="h-80">
                  <Line 
                    data={emissionsChartData} 
                    options={chartOptions}
                  />
                </div>
              </div>
            )}
            
            {treeLossChartData && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Tree Cover Loss by Year</h3>
                <div className="h-80">
                  <Bar 
                    data={treeLossChartData}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales.y,
                          title: {
                            display: true,
                            text: 'Area (hectares)',
                            color: '#e2e8f0'
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
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Additional Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                <h4 className="text-sm font-medium text-gray-400">Carbon Stocks</h4>
                <p className="text-xl font-semibold mt-1 text-white">{forestData.stats.carbon_stocks.formatted}</p>
              </div>
              
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                <h4 className="text-sm font-medium text-gray-400">Tree Cover (2000)</h4>
                <p className="text-xl font-semibold mt-1 text-white">{forestData.stats.tree_cover_extent["2000"].formatted}</p>
              </div>
              
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                <h4 className="text-sm font-medium text-gray-400">Tree Cover (2010)</h4>
                <p className="text-xl font-semibold mt-1 text-white">{forestData.stats.tree_cover_extent["2010"].formatted}</p>
              </div>
              
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                <h4 className="text-sm font-medium text-gray-400">Tree Cover Gain (2000-2020)</h4>
                <p className="text-xl font-semibold mt-1 text-white">{forestData.stats.tree_cover_gain_2000_2020.formatted}</p>
              </div>
              
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                <h4 className="text-sm font-medium text-gray-400">Density Threshold</h4>
                <p className="text-xl font-semibold mt-1 text-white">{forestData.density_threshold}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default Dashboard;

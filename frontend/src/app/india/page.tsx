
"use client"

import React, { useState, useEffect } from 'react';
import { 
  Line, 
  Bar, 
  Pie,
  LineChart,
  BarChart, 
  XAxis, 
  YAxis 
} from 'recharts';
import { AlertCircle, MapPin, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import FloatingChatbot from '../components/Chatbot';
import Footer from '../components/footer';
import { FloatingNavDemo } from '../components/navbar';


interface FormattedValue {
  value: number;
  formatted: string;
}

interface YearlyData {
  [year: string]: FormattedValue;
}

interface ForestData {
  density_threshold: number;
  stats: {
    tree_cover_area: FormattedValue;
    carbon_stocks: FormattedValue;
    carbon_density: FormattedValue;
    tree_cover_extent: {
      [year: string]: FormattedValue;
    };
    tree_cover_gain_2000_2020: FormattedValue;
  };
  yearly_data: {
    emissions: {
      [year: string]: FormattedValue;
    };
    tree_loss: {
      [year: string]: FormattedValue;
    };
  };
  analysis: {
    forest_health_status: 'Decline' | 'Stable' | 'Improvement';
    total_emissions: FormattedValue;
    net_forest_change: FormattedValue & { percent?: string };
    total_loss: FormattedValue;
  };
}

const IndiaForestDashboard: React.FC = () => {
  const [forestData, setForestData] = useState<ForestData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDensity, setSelectedDensity] = useState<number>(30);
  
  // Available density thresholds
  const DENSITIES: number[] = [0, 10, 15, 20, 25, 30, 50, 75];
  
  // Fetch data from the API
  const fetchData = async (density: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://tech-thrive.onrender.com/data/india/${density}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data = await response.json();
      setForestData(data as ForestData);
    } catch (err) {
      console.error('Error fetching India forest data:', err);
      setError('Failed to load forest data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data initially and when density changes
  useEffect(() => {
    fetchData(selectedDensity);
  }, [selectedDensity]);
  
  // Prepare chart data for emissions
  const emissionsData = forestData?.yearly_data?.emissions 
    ? Object.entries(forestData.yearly_data.emissions).map(([year, data]) => ({
        year,
        emissions: data.value,
        formattedValue: data.formatted
      }))
    : [];
  
  // Prepare chart data for tree loss
  const treeLossData = forestData?.yearly_data?.tree_loss 
    ? Object.entries(forestData.yearly_data.tree_loss).map(([year, data]) => ({
        year,
        loss: data.value,
        formattedValue: data.formatted
      }))
    : [];
    
  // Prepare tree cover extent data for pie chart
  const prepareExtentData = (): { name: string; value: number; formattedValue: string }[] => {
    if (!forestData?.stats?.tree_cover_extent) return [];
    
    const years = Object.keys(forestData.stats.tree_cover_extent);
    return years.map(year => ({
      name: year,
      value: forestData.stats.tree_cover_extent[year].value,
      formattedValue: forestData.stats.tree_cover_extent[year].formatted
    }));
  };
  
  const treeExtentData = prepareExtentData();
  
  // Get forest health status color
  const getHealthStatusColor = (status: string): string => {
    switch(status) {
      case 'Decline': return 'text-red-500';
      case 'Stable': return 'text-yellow-500';
      case 'Improvement': return 'text-green-500';
      default: return 'text-purple-500';
    }
  };
  
  const getHealthIcon = (status: string): React.ReactNode => {
    switch(status) {
      case 'Decline': return <TrendingDown className="h-6 w-6 text-red-500" />;
      case 'Stable': return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'Improvement': return <TrendingUp className="h-6 w-6 text-green-500" />;
      default: return null;
    }
  };

  return (
    <>
  <div className="container mx-auto px-4 py-8 w-full bg-neutral-950 text-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 mt-18 text-center text-purple-300">
        India Forest Monitoring Dashboard
      </h1>
      
      {/* Density Selector */}
      <div className="mb-8 max-w-md mx-auto">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tree Cover Density Threshold (%)
        </label>
        <select
          value={selectedDensity}
          onChange={(e) => setSelectedDensity(Number(e.target.value))}
          className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-purple-700 focus:border-purple-500"
        >
          {DENSITIES.map((density) => (
            <option key={density} value={density}>
              {density}%
            </option>
          ))}
        </select>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border-l-4 border-red-500 p-4 mb-8 mx-auto max-w-4xl">
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
          <span className="ml-3 text-lg text-purple-300">Loading data...</span>
        </div>
      )}
      
      {/* Dashboard Content */}
      {forestData && !loading && (
        <div className="space-y-8">
          {/* Header with location info */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 w-full mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-400 mr-3" />
                <div>
                  <h2 className="text-3xl font-bold text-white">India</h2>
                  <p className="text-sm text-gray-400">National Forest Data</p>
                </div>
              </div>
              <div className="flex items-center">
                {getHealthIcon(forestData.analysis.forest_health_status)}
                <div className="ml-2">
                  <p className="text-sm text-gray-400">Forest Health Status</p>
                  <p className={`text-xl font-bold ${getHealthStatusColor(forestData.analysis.forest_health_status)}`}>
                    {forestData.analysis.forest_health_status}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Tree Cover</h3>
              <p className="text-2xl font-bold text-white">{forestData.stats.tree_cover_area.formatted}</p>
              <p className="text-sm text-gray-400 mt-2">
                At {forestData.density_threshold}% density threshold
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Carbon Stocks</h3>
              <p className="text-2xl font-bold text-white">{forestData.stats.carbon_stocks.formatted}</p>
              <p className="text-sm text-gray-400 mt-2">
                Carbon density: {forestData.stats.carbon_density.formatted}
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Emissions</h3>
              <p className="text-2xl font-bold text-white">{forestData.analysis.total_emissions.formatted}</p>
              <p className="text-sm text-gray-400 mt-2">
                Due to forest loss
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Net Forest Change</h3>
              <p className={`text-2xl font-bold ${forestData.analysis.net_forest_change.value < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {forestData.analysis.net_forest_change.formatted}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {forestData.analysis.net_forest_change.percent 
                  ? `${forestData.analysis.net_forest_change.percent}%` 
                  : 'Percentage not available'}
              </p>
            </div>
          </div>
          
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emissions Chart */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">CO₂ Emissions Over Time</h3>
              <div className="h-80">
                <LineChart
                  width={450}
                  height={300}
                  data={emissionsData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="year" stroke="#e2e8f0" />
                  <YAxis stroke="#e2e8f0" />
                  <Line 
                    type="monotone" 
                    dataKey="emissions" 
                    stroke="#ff6b8b" 
                    activeDot={{ r: 8 }} 
                    name="CO₂ Emissions (Mg)"
                  />
                </LineChart>
              </div>
            </div>
            
            {/* Tree Loss Chart */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Tree Cover Loss by Year</h3>
              <div className="h-80">
                <BarChart
                  width={450}
                  height={300}
                  data={treeLossData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="year" stroke="#e2e8f0" />
                  <YAxis stroke="#e2e8f0" />
                  <Bar 
                    dataKey="loss" 
                    fill="#9333ea" 
                    name="Tree Loss (hectares)"
                  />
                </BarChart>
              </div>
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Historical Forest Data</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tree Cover Extent Comparison */}
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                <h4 className="text-md font-medium text-gray-300 mb-3">Tree Cover Extent by Year</h4>
                {forestData.stats.tree_cover_extent && (
                  <div className="space-y-2">
                    {Object.entries(forestData.stats.tree_cover_extent).map(([year, data]) => (
                      <div key={year} className="flex justify-between items-center">
                        <span className="text-gray-400">{year}:</span>
                        <span className="text-white font-medium">{data.formatted}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tree Cover Gain */}
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                <h4 className="text-md font-medium text-gray-300 mb-3">Forest Growth & Loss</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm text-gray-400">Tree Cover Gain (2000-2020)</h5>
                    <p className="text-xl font-semibold mt-1 text-green-400">
                      {forestData.stats.tree_cover_gain_2000_2020.formatted}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="text-sm text-gray-400">Total Tree Cover Loss</h5>
                    <p className="text-xl font-semibold mt-1 text-red-400">
                      {forestData.analysis.total_loss.formatted}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with metadata */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 text-center text-sm text-gray-400">
            <p>Data source: Global Forest Watch and TechThrive API</p>
            <p className="mt-1">Density threshold applied: {forestData.density_threshold}%</p>
          </div>
        </div>
      )}
    </div>
<footer>
    <Footer/>
    </footer>
    <div>
    <FloatingNavDemo/>
    <FloatingChatbot/>
    </div>
    </>
  
  );
};

export default IndiaForestDashboard;
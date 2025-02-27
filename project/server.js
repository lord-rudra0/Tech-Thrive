import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API base URL
const API_BASE_URL = 'https://tech-thrive.onrender.com';

// Proxy endpoint for state data
app.get('/api/state/:state/:density', async (req, res) => {
  try {
    const { state, density } = req.params;
    const response = await axios.get(`${API_BASE_URL}/data/state/${state.toLowerCase()}/${density}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching state data:', error);
    res.status(500).json({ error: 'Failed to fetch state data' });
  }
});

// Proxy endpoint for district data
app.get('/api/district/:district/:density', async (req, res) => {
  try {
    const { district, density } = req.params;
    const response = await axios.get(`${API_BASE_URL}/data/state/${district.toLowerCase()}/${density}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching district data:', error);
    res.status(500).json({ error: 'Failed to fetch district data' });
  }
});

// Proxy endpoint for India data
app.get('/api/india/:density', async (req, res) => {
  try {
    const { density } = req.params;
    const response = await axios.get(`${API_BASE_URL}/data/india/${density}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching India data:', error);
    res.status(500).json({ error: 'Failed to fetch India data' });
  }
});

// Proxy endpoint for available locations
app.get('/api/available-locations', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/data/available-locations`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching available locations:', error);
    res.status(500).json({ error: 'Failed to fetch available locations' });
  }
});

// Proxy endpoint for densities
app.get('/api/densities', async (req, res) => {
  try {
    const { location } = req.query;
    const response = await axios.get(`${API_BASE_URL}/data/densities?location=${location}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching densities:', error);
    res.status(500).json({ error: 'Failed to fetch densities' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
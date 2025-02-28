# Forest Monitoring Application

A web application for monitoring forest health and tree cover changes across India.

## Features

- Interactive map visualization of forest regions
- Dashboard with data analytics for forest health
- Charts showing CO₂ emissions and tree cover loss over time
- Filter data by state, district, or all of India
- Adjustable density threshold for analysis

## API Endpoints

The application uses the following API endpoints:

### State Data
```
GET /api/state/:state/:density
```
- `:state` - The name of the state (lowercase)
- `:density` - The density threshold percentage

### District Data
```
GET /api/district/:district/:density
```
- `:district` - The name of the district (lowercase)
- `:density` - The density threshold percentage

### India Data
```
GET /api/india/:density
```
- `:density` - The density threshold percentage

### Available Locations
```
GET /api/available-locations
```
Returns a list of available locations (states and districts)

### Densities
```
GET /api/densities?location=:location
```
- `:location` - The name of the location to get available densities for

## Running Locally

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
   This will start both the Express backend server and the React frontend.

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Technologies Used

- React for the frontend
- Express for the backend API
- Chart.js for data visualization
- Google Maps API for map visualization
- Tailwind CSS for styling

## Environment Setup

For the Google Maps integration to work properly, you need to:

1. Replace `YOUR_GOOGLE_MAPS_API_KEY` in the `ForestMap.jsx` component with a valid Google Maps API key
2. Ensure the API key has the Maps JavaScript API enabled

## Data Source

The application fetches data from the Tech Thrive API at `https://tech-thrive.onrender.com`.
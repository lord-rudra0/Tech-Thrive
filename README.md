# ForestWatch - Intelligent Forest Monitoring Platform

An advanced web application for monitoring and analyzing forest health, tree cover changes, and environmental impact across India, powered by AI-driven insights and real-time data analysis.

## 🌟 Key Features

### 1. Interactive Dashboard
- **Location-based Analysis**: Filter data by state or district
- **Custom Density Thresholds**: Adjustable thresholds for precise analysis
- **Real-time Statistics**: 
  - Tree cover area
  - Carbon stocks
  - Carbon density
  - Forest health status
  - Net forest change
  - Total emissions

### 2. AI-Powered Chatbot
- **Intelligent Analysis**: Real-time forest data interpretation
- **Context-Aware Responses**: Maintains conversation context about selected locations
- **News Integration**: Provides relevant local forest-related news
- **Interactive Assistance**: 
  - Answers questions about forest data
  - Provides conservation insights
  - Links to relevant SDGs (Sustainable Development Goals)

### 3. Visualization Tools
- **Interactive Maps**: Visual representation of forest regions
- **Dynamic Charts**:
  - Tree cover changes over time
  - CO₂ emissions trends
  - Year-over-year comparisons
  - Forest health indicators

### 4. Data Analysis
- **Comprehensive Metrics**:
  - Historical tree cover data (2000-present)
  - Carbon stock analysis
  - Tree cover gain/loss
  - Environmental impact assessment
- **Trend Analysis**: Track changes and patterns over time
- **Health Assessment**: Forest health status indicators

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- Google Cloud API key (for Maps integration)
- Gemini API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lord-rudra0/Tech-Thrive
cd Tech-Thrive
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the backend directory:
```env
GOOGLE_API_KEY=your_google_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key
```

5. Start the development servers:

Backend:
```bash
python app.py
```

Frontend:
```bash
npm run dev
```

## 🔌 API Endpoints

### Forest Data Endpoints
- `GET /api/state/:state/:density` - Get state-level forest data
- `GET /api/district/:district/:density` - Get district-level forest data
- `GET /api/india/:density` - Get national-level forest data
- `GET /api/available-locations` - Get list of available locations
- `GET /api/densities` - Get available density thresholds

### Analysis Endpoints
- `POST /api/analyze` - Get AI analysis of forest data
- `POST /api/chat` - Interact with the AI chatbot

## 💻 Technologies Used

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Chart.js
- Google Maps API
- Lucide Icons

### Backend
- Python
- Flask
- Next.js
- Google Generative AI (Gemini)
- Pandas
- Python-dotenv

### APIs and Services
- Google Maps Platform
- Google Generative AI
- News API (for forest-related news)

## 📊 Data Sources
- Forest cover data from satellite imagery
- Carbon stock measurements
- Historical forest change data (2000-2023)
- Real-time news integration

## 🛠️ Development

### Code Structure
```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
├── backend/
│   ├── app.py
│   ├── data.py
│   └── requirements.txt
```

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments
- Google Earth Engine for satellite imagery
- Global Forest Watch for forest data
- Contributors and maintainers
 
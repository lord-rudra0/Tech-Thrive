# ForestWatch - Intelligent Forest Monitoring Platform

An advanced web application for monitoring forest health, analyzing carbon emissions, and tracking tree cover changes across India. Powered by AI-driven insights and real-time data analysis.

## 🌟 Key Features

### 1. Interactive Dashboard
- **Location-based Analysis**: 
  - Filter by state or district
  - Custom density threshold selection
  - No default values - user-driven analysis
- **Real-time Statistics**: 
  - Tree cover area
  - Carbon stocks and density
  - Forest health status
  - Net forest change with percentage
  - Total emissions and loss

### 2. AI-Powered Chatbot
- **Intelligent Analysis**: 
  - Automatic analysis when filters are applied
  - Context-aware responses based on selected location
  - Maintains conversation history
- **Interactive Features**:
  - Auto-opens with initial analysis
  - Supports follow-up questions
  - Provides conservation insights
  - Real-time data interpretation

### 3. Data Visualization
- **Dynamic Charts**:
  - CO₂ emissions over time
  - Tree cover loss by year
  - Historical forest data comparison
  - Forest health indicators

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- Google Generative AI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/forestwatch
cd forestwatch
```

2. Frontend Setup:
```bash
cd frontend
npm install
```

3. Backend Setup:
```bash
cd backend
pip install -r requirements.txt
```

4. Environment Configuration:
Create a `.env` file in the backend directory:
```env
GOOGLE_API_KEY=your_gemini_api_key
```

5. Start the Services:

Backend:
```bash
cd backend
python app.py
```

Frontend:
```bash
cd frontend
npm run dev
```

## 🔌 API Endpoints

### Data Endpoints
- `GET /data/state/:state/:density` - State-level forest data
- `GET /data/district/:district/:density` - District-level forest data
- `GET /data/india/:density` - National-level forest data
- `GET /data/available-locations` - List of available locations

### Analysis Endpoints
- `POST /api/analyze` - AI analysis of forest data
  ```json
  {
    "location": "string",
    "location_type": "string",
    "density_threshold": "number",
    "stats": { ... },
    "yearly_data": { ... },
    "analysis": { ... }
  }
  ```
- `POST /api/chat` - Interactive chatbot
  ```json
  {
    "message": "string",
    "context": {
      "location": "string",
      "forestData": { ... }
    }
  }
  ```

## 💻 Technology Stack

### Frontend
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- Chart.js/Recharts
- Framer Motion
- Lucide Icons

### Backend
- Python/Flask
- Google Generative AI (Gemini)
- Pandas for data processing
- Python-dotenv for configuration

## 📁 Project Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── Chatbot.tsx
│   │   │   │   ├── data-dashboard.tsx
│   │   │   │   └── ...
│   │   │   ├── india/
│   │   │   │   └── page.tsx
│   │   │   └── ...
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env
```

## 🔑 Key Components

### Dashboard
- Dynamic filtering with density selection
- Manual filter application via submit button
- Integrated AI analysis
- Real-time data visualization

### Chatbot
- Automatic opening on analysis
- Context-aware conversations
- Persistent chat history
- Loading states and error handling

## 🛠️ Development

### Running Tests
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
python -m pytest
```

### Environment Variables
Required variables in `.env`:
- `GOOGLE_API_KEY`: Gemini API key for AI features

## 📝 Notes
- Density threshold must be selected before analysis
- Chat analysis is triggered automatically on filter
- All data is fetched on-demand for performance

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
- Google Earth Engine for satellite imagery
- Global Forest Watch for forest data
- Contributors and maintainers
 
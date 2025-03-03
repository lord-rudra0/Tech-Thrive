from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from datetime import datetime
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Google AI
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        location = data.get('location')
        location_type = data.get('location_type')
        density_threshold = data.get('density_threshold')
        stats = data.get('stats')
        yearly_data = data.get('yearly_data')
        analysis = data.get('analysis')

        # Create analysis prompt
        analysis_prompt = f'''
As a sustainable development expert focusing on forest conservation, analyze this forest data for {location}:

Forest Statistics:
- Total Forest Area: {stats.get('total_forest_area', 'N/A')} hectares
- Forest Cover Percentage: {stats.get('forest_cover_percentage', 'N/A')}%
- Net Forest Change: {analysis.get('net_forest_change', {}).get('percent', 'N/A')}% ({analysis.get('net_forest_change', {}).get('value', 'N/A')} hectares)
- Tree Extent: {stats.get('tree_extent', 'N/A')} hectares
- Tree Cover Loss: {stats.get('tree_cover_loss', 'N/A')} hectares
- Tree Cover Gain: {stats.get('tree_cover_gain', 'N/A')} hectares

Yearly Data:
{chr(10).join([f"- {year}: {data.get('value', 'N/A')} hectares" for year, data in yearly_data.items()])}

Provide a comprehensive analysis that:
1. Evaluates the current forest health status
2. Identifies key trends and patterns
3. Highlights potential concerns or improvements
4. Suggests conservation strategies
5. Uses simple, clear language suitable for a general audience
'''

        # Generate analysis
        ai_response = model.generate_content(analysis_prompt)
        
        # Prepare response
        complete_analysis = {
            'location': location,
            'forest_data': {
                'stats': stats,
                'yearly_data': yearly_data,
                'analysis': analysis
            },
            'ai_analysis': {
                'summary': ai_response.text,
                'timestamp': datetime.now().isoformat()
            }
        }

        return jsonify(complete_analysis)

    except Exception as e:
        print(f"Error in analyze endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message')
        location = data.get('location')
        forest_data = data.get('forest_data')

        # Create the prompt with context
        chat_prompt = f'''
As a sustainable development expert focusing on forest conservation:

User Question: {message}

{f"Location Context: {location}" if location else ""}

Provide a helpful response that:
1. Addresses the question directly
2. Uses simple, clear language
3. Provides practical insights
'''

        # Generate response
        ai_response = model.generate_content(chat_prompt)
        
        return jsonify({
            'response': ai_response.text,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 
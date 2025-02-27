from flask import Flask, jsonify, request
from flask_cors import CORS
import google.generativeai as genai
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

def generate_chat_response(forest_data, user_query):
    try:
        # Create context from forest data
        context = f'''
        Forest data for {forest_data.get('location_info', {}).get('name')}:
        - Tree Cover: {forest_data.get('key_metrics', {}).get('tree_cover')}
        - Carbon Stocks: {forest_data.get('key_metrics', {}).get('carbon_stocks')}
        - Forest Health: {forest_data.get('environmental_impact', {}).get('health_status')}
        - Net Change: {forest_data.get('forest_changes', {}).get('net_change', {}).get('value')}
        '''
        
        # Create prompt with context and user query
        prompt = f'''
        Based on this forest data:
        {context}
        
        Answer this question in simple English: {user_query}
        
        Focus on providing practical insights and clear explanations.
        '''
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        
        return {
            "query": user_query,
            "context": {
                "location": forest_data.get('location_info', {}).get('name'),
                "data_summary": forest_data.get('key_metrics')
            },
            "response": response.text,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        forest_data = data.get('forest_data')
        user_query = data.get('query')
        
        if not forest_data or not user_query:
            return jsonify({"error": "Missing forest data or query"}), 400
            
        response = generate_chat_response(forest_data, user_query)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001)

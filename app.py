from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime
import json
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure API keys
GEMINI_KEY = os.getenv('GEMINI_API_KEY')
SEARCH_KEY = os.getenv('GOOGLE_SEARCH_API_KEY')
SEARCH_ENGINE_ID = os.getenv('GOOGLE_SEARCH_ENGINE_ID')

# Configure Gemini
genai.configure(api_key=GEMINI_KEY)

# Initialize the model with the correct name
try:
    model = genai.GenerativeModel('gemini-2.0-flash')  # Updated model name
except Exception as e:
    print(f"Error initializing Gemini model: {str(e)}")

def format_value(value, unit):
    if pd.isna(value): return "No data"
    if abs(value) >= 1e9: return f"{value/1e9:,.2f} B {unit}"
    elif abs(value) >= 1e6: return f"{value/1e6:,.2f} M {unit}"
    elif abs(value) >= 1e3: return f"{value/1e3:,.2f} K {unit}"
    return f"{value:,.2f} {unit}"

def search_news(location):
    try:
        search_query = f"forest conservation and carbon emissions and air pollution and air quality news in {location}"
        response = requests.get(
            "https://www.googleapis.com/customsearch/v1",
            params={
                "key": os.getenv('GOOGLE_SEARCH_API_KEY'),
                "cx": os.getenv('GOOGLE_SEARCH_ENGINE_ID'),
                "q": search_query,
                "num": 5
            }
        )
        return response.json().get('items', [])
    except Exception as e:
        print(f"Search error: {str(e)}")
        return []

def analyze_trends(data):
    try:
        yearly_loss = data['yearly_data']['tree_loss']
        yearly_emissions = data['yearly_data']['emissions']
        
        # Calculate trends
        recent_years = list(range(2019, 2024))
        recent_loss = [yearly_loss.get(str(year), {}).get('value', 0) for year in recent_years]
        recent_emissions = [yearly_emissions.get(str(year), {}).get('value', 0) for year in recent_years]
        
        avg_recent_loss = sum(x for x in recent_loss if x is not None) / len([x for x in recent_loss if x is not None])
        avg_recent_emissions = sum(x for x in recent_emissions if x is not None) / len([x for x in recent_emissions if x is not None])
        
        return {
            'recent_average_loss': avg_recent_loss,
            'recent_average_emissions': avg_recent_emissions,
            'trend': 'increasing' if recent_loss[-1] > recent_loss[0] else 'decreasing'
        }
    except Exception as e:
        print(f"Trend analysis error: {str(e)}")
        return {}

def analyze_data(location=None, density_threshold=None, is_country=False):
    try:
        sheets = {
            'carbon': 'Country carbon data' if is_country else 'Subnational 2 carbon data',
            'tree': 'Country tree cover loss' if is_country else 'Subnational 2 tree cover loss'
        }
        
        carbon_data = pd.read_excel('IND.xlsx', sheet_name=sheets['carbon'])
        tree_data = pd.read_excel('IND.xlsx', sheet_name=sheets['tree'])
        
        if not is_country:
            if location.lower() in [str(x).lower() for x in carbon_data['state'].dropna()]:
                sheets['carbon'] = 'Subnational 1 carbon data'
                sheets['tree'] = 'Subnational 1 tree cover loss'
                carbon_data = pd.read_excel('IND.xlsx', sheet_name=sheets['carbon'])
                tree_data = pd.read_excel('IND.xlsx', sheet_name=sheets['tree'])
                location_type = 'state'
            elif location.lower() in [str(x).lower() for x in carbon_data['district'].dropna()]:
                location_type = 'district'
            else:
                return {"error": "Location not found in the database."}

        # Filter and process data
        if is_country:
            thresholds = sorted(carbon_data['umd_tree_cover_density_2000__threshold'].unique())
            if density_threshold is None:
                return {'available_densities': thresholds}
            carbon_row = carbon_data[carbon_data['umd_tree_cover_density_2000__threshold'] == density_threshold]
            tree_row = tree_data[tree_data['threshold'] == density_threshold]
        else:
            carbon_row = carbon_data[carbon_data[location_type].str.contains(location, case=False, na=False)]
            tree_row = tree_data[tree_data[location_type].str.contains(location, case=False, na=False)]
            thresholds = sorted(carbon_row['umd_tree_cover_density_2000__threshold'].unique())
            if density_threshold is None:
                return {
                    'location': location,
                    'location_type': location_type,
                    'available_densities': thresholds
                }
            carbon_row = carbon_row[carbon_row['umd_tree_cover_density_2000__threshold'] == density_threshold]
            tree_row = tree_row[tree_row['threshold'] == density_threshold]

        if carbon_row.empty or tree_row.empty:
            return {"error": "No data found for the specified parameters."}

        row_data = carbon_row.iloc[0]
        tree_row_data = tree_row.iloc[0]

        # Collect stats
        stats = {
            'tree_cover_area': {
                'value': float(row_data['umd_tree_cover_extent_2000__ha']),
                'formatted': format_value(row_data['umd_tree_cover_extent_2000__ha'], 'hectares')
            },
            'carbon_stocks': {
                'value': float(row_data['gfw_aboveground_carbon_stocks_2000__Mg_C']),
                'formatted': format_value(row_data['gfw_aboveground_carbon_stocks_2000__Mg_C'], 'Mg C')
            },
            'carbon_density': {
                'value': float(row_data['avg_gfw_aboveground_carbon_stocks_2000__Mg_C_ha-1']),
                'formatted': format_value(row_data['avg_gfw_aboveground_carbon_stocks_2000__Mg_C_ha-1'], 'Mg C/ha')
            },
            'tree_cover_extent': {
                '2000': {
                    'value': float(tree_row_data['extent_2000_ha']),
                    'formatted': format_value(tree_row_data['extent_2000_ha'], 'hectares')
                },
                '2010': {
                    'value': float(tree_row_data['extent_2010_ha']),
                    'formatted': format_value(tree_row_data['extent_2010_ha'], 'hectares')
                }
            },
            'tree_cover_gain_2000_2020': {
                'value': float(tree_row_data['gain_2000-2020_ha']),
                'formatted': format_value(tree_row_data['gain_2000-2020_ha'], 'hectares')
            }
        }
        
        # Collect yearly data
        yearly_data = {
            'tree_loss': {},
            'emissions': {}
        }
        
        total_loss = 0
        total_emissions = 0
        
        for year in range(2001, 2024):
            # Tree loss data
            loss_col = f'tc_loss_ha_{year}'
            loss_value = tree_row_data[loss_col]
            if not pd.isna(loss_value):
                total_loss += float(loss_value)
            yearly_data['tree_loss'][str(year)] = {
                'value': float(loss_value) if not pd.isna(loss_value) else None,
                'formatted': format_value(loss_value, 'hectares')
            }
            
            # Emissions data
            emissions_col = f'gfw_forest_carbon_gross_emissions_{year}__Mg_CO2e'
            emissions_value = row_data[emissions_col]
            if not pd.isna(emissions_value):
                total_emissions += float(emissions_value)
            yearly_data['emissions'][str(year)] = {
                'value': float(emissions_value) if not pd.isna(emissions_value) else None,
                'formatted': format_value(emissions_value, 'Mg CO₂e')
            }

        # Calculate analysis metrics
        net_change = stats['tree_cover_gain_2000_2020']['value'] - total_loss
        net_change_percent = (net_change / stats['tree_cover_extent']['2000']['value'] * 100) if stats['tree_cover_extent']['2000']['value'] != 0 else 0

        analysis = {
            'net_forest_change': {
                'value': net_change,
                'formatted': format_value(net_change, 'hectares'),
                'percent': round(net_change_percent, 2)
            },
            'total_emissions': {
                'value': total_emissions,
                'formatted': format_value(total_emissions, 'Mg CO₂e')
            },
            'total_loss': {
                'value': total_loss,
                'formatted': format_value(total_loss, 'hectares')
            },
            'forest_health_status': 'Expansion' if net_change > 0 else 'Decline' if net_change < 0 else 'Stable'
        }

        return {
            'location': location if not is_country else 'India',
            'location_type': location_type if not is_country else 'country',
            'density_threshold': density_threshold,
            'stats': stats,
            'yearly_data': yearly_data,
            'analysis': analysis
        }

    except Exception as e:
        return {"error": str(e)}

@app.route('/data/available-locations', methods=['GET'])
def get_available_locations():
    try:
        print("Accessing available locations...") # Debug log
        carbon_data = pd.read_excel('IND.xlsx', 
                                  sheet_name='Subnational 2 carbon data')
        
        states = sorted(set(str(x).lower() for x in carbon_data['state'].dropna()))
        districts = sorted(set(str(x).lower() for x in carbon_data['district'].dropna()))
        
        response = {
            'states': states,
            'districts': districts
        }
        print(f"Found {len(states)} states and {len(districts)} districts") # Debug log
        return jsonify(response)
    except Exception as e:
        print(f"Error in get_available_locations: {str(e)}") # Debug log
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return jsonify({
        "message": "Forest Data API",
        "version": "1.0",
        "endpoints": {
            "root": "/",
            "available_locations": "/data/available-locations",
            "state_data": "/data/state/<state_name>/<density>",
            "district_data": "/data/district/<district_name>/<density>",
            "india_data": "/data/india/<density>",
            "densities": "/data/densities?location=<location>",
            "analyze": "/data/analyze/<location>/<density>"
        }
    })

@app.route('/data/state/<state_name>/<density>', methods=['GET'])
def get_state_data(state_name, density):
    try:
        density = float(density)
        result = analyze_data(state_name, density)
        return jsonify(result)
    except ValueError:
        return jsonify({"error": "Invalid density value"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/data/district/<district_name>/<density>', methods=['GET'])
def get_district_data(district_name, density):
    try:
        density = float(density)
        result = analyze_data(district_name, density)
        return jsonify(result)
    except ValueError:
        return jsonify({"error": "Invalid density value"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/data/india/<density>', methods=['GET'])
def get_india_data(density):
    try:
        density = float(density)
        result = analyze_data(density_threshold=density, is_country=True)
        return jsonify(result)
    except ValueError:
        return jsonify({"error": "Invalid density value"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/data/densities', methods=['GET'])
def get_available_densities():
    try:
        location = request.args.get('location')
        print(f"Getting densities for location: {location}")
        if location:
            result = analyze_data(location)
        else:
            result = analyze_data(is_country=True)
            
        if 'available_densities' in result:
            # Convert numpy int64/float64 to Python native types
            densities = [float(d) for d in result['available_densities']]
            return jsonify({'densities': densities})
        return jsonify({"error": "Could not retrieve density thresholds"}), 404
    except Exception as e:
        print(f"Error in get_available_densities: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500
    
@app.route('/data/analyze/<location>/<density>', methods=['GET'])
def analyze_location_data(location, density):
    try:
        # Get forest data
        forest_data = analyze_data(location, float(density))
        if isinstance(forest_data, str) or 'error' in forest_data:
            return jsonify({"error": "Could not retrieve forest data"}), 404

        # Get news and current events
        news_data = search_news(location)
        
        # Analyze trends
        trends = analyze_trends(forest_data)
        
        # Prepare data for AI analysis
        analysis_prompt = f'''
        Analyze this forest data for {location}:
        - Current forest cover: {forest_data['stats']['tree_cover_area']['formatted']}
        - Carbon stocks: {forest_data['stats']['carbon_stocks']['formatted']}
        - Recent trend: {trends['trend']}
        - Net forest change: {forest_data['analysis']['net_forest_change']['formatted']}
        
        Please provide:
        1. Simple explanation of the current forest situation
        2. Historical context and changes
        3. Future implications
        4. Environmental impact
        5. Recommendations for conservation
        
        Keep the language simple and conversational.
        '''
        
        # Get AI analysis
        ai_response = model.generate_content(analysis_prompt)
        
        # Combine all data
        complete_analysis = {
            'location': location,
            'forest_data': forest_data,
            'trends': trends,
            'current_news': [{
                'title': item.get('title', ''),
                'snippet': item.get('snippet', ''),
                'link': item.get('link', '')
            } for item in news_data],
            'ai_analysis': {
                'summary': ai_response.text,
                'timestamp': datetime.now().isoformat()
            }
        }
        
        return jsonify(complete_analysis)
        
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        return jsonify({"error": str(e)}), 500

def extract_location_from_data(data):
    # Extract location from the forest data
    if 'location' in data:
        return data['location']
    elif 'stats' in data and 'location' in data['stats']:
        return data['stats']['location']
    return None

def analyze_forest_trends(data):
    try:
        yearly_data = data.get('yearly_data', {})
        tree_loss = yearly_data.get('tree_loss', {})
        emissions = yearly_data.get('emissions', {})
        
        # Calculate recent trends
        recent_years = sorted(tree_loss.keys())[-5:]  # Last 5 years
        recent_loss = [float(tree_loss[year]['value']) for year in recent_years if tree_loss[year]['value'] is not None]
        recent_emissions = [float(emissions[year]['value']) for year in recent_years if emissions[year]['value'] is not None]
        
        return {
            'average_annual_loss': sum(recent_loss) / len(recent_loss) if recent_loss else 0,
            'average_annual_emissions': sum(recent_emissions) / len(recent_emissions) if recent_emissions else 0,
            'trend': 'increasing' if recent_loss[-1] > recent_loss[0] else 'decreasing' if recent_loss else 'stable',
            'years_analyzed': recent_years
        }
    except Exception as e:
        print(f"Trend analysis error: {str(e)}")
        return {}

def get_sdg_context(forest_data, trends):
    sdg_goals = {
        'SDG 13': 'Climate Action',
        'SDG 15': 'Life on Land',
        'SDG 6': 'Clean Water and Sanitation'
    }
    
    context = []
    for sdg, description in sdg_goals.items():
        if sdg == 'SDG 15':
            context.append({
                'goal': sdg,
                'description': description,
                'relevance': f"Forest coverage and biodiversity impact in {forest_data['location']}",
                'metrics': {
                    'forest_cover': forest_data['stats']['tree_cover_area']['formatted'],
                    'trend': trends['trend']
                }
            })
        elif sdg == 'SDG 13':
            context.append({
                'goal': sdg,
                'description': description,
                'relevance': 'Carbon emissions and climate impact',
                'metrics': {
                    'carbon_stocks': forest_data['stats']['carbon_stocks']['formatted'],
                    'emissions_trend': trends['average_annual_emissions']
                }
            })
    return context


@app.route('/api/analyze', methods=['POST'])
def analyze_forest_data():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        location = data.get('location', 'the specified region')
        
        # Get recent news
        news_data = search_news(location)
        
        # Create analysis prompt
        analysis_prompt = f'''
        Based on the forest data for {location}, provide a natural, conversational analysis in simple English. Include:

        Current Situation:
        - Forest cover: {data['stats']['tree_cover_area']['formatted']}
        - Carbon stored: {data['stats']['carbon_stocks']['formatted']}
        - Carbon density: {data['stats']['carbon_density']['formatted']}
        
        Recent Changes (2021-2023):
        - 2021 tree loss: {data['yearly_data']['tree_loss']['2021']['formatted']}
        - 2022 tree loss: {data['yearly_data']['tree_loss']['2022']['formatted']}
        - 2023 tree loss: {data['yearly_data']['tree_loss']['2023']['formatted']}
        
        Overall change: {data['analysis']['net_forest_change']['formatted']}

        Write a comprehensive yet simple analysis that a general audience can understand. Include:
        1. The current state of forests
        2. Recent changes and their significance
        3. Environmental impacts
        4. Future outlook
        5. Conservation needs

        Format the response as a continuous narrative, avoiding technical jargon. Don't use bullet points or numbered lists.
        '''
        
        # Get AI analysis
        ai_response = model.generate_content(analysis_prompt)
        
        # Get news in simple format
        news_prompt = f'''
        Based on these news items about {location}'s forests and environment:
        {chr(10).join([f"- {news.get('title', '')}" for news in news_data[:3]])}

        Provide a brief, simple summary of the recent news in 2-3 sentences, written in conversational English.
        '''
        
        news_summary = model.generate_content(news_prompt)
        
        # Combine analysis and news in plain text
        complete_text = f'''
{ai_response.text}

Recent News:
{news_summary.text}
'''
        
        return jsonify({
            'analysis': complete_text
        })
        
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST', 'GET'])
def chat_interaction():
    try:
        # First try to get message from query parameters
        message = request.args.get('message', '')
        
        # If no message in query params, try request body
        if not message:
            if request.is_json:
                message = request.json.get('message', '')
            else:
                message = request.get_data(as_text=True)
        
        # Clean up the message
        message = message.strip('"').strip()
        
        if not message:
            return "Please provide a question either as a query parameter or in the request body", 400

        # Extract location from message
        location = None
        if "in" in message.lower():
            parts = message.lower().split("in")
            if len(parts) > 1:
                location = parts[1].strip()

        # Get relevant news if location is found
        news_data = []
        if location:
            news_data = search_news(location)
            
        chat_prompt = f'''
        As a sustainable development expert focusing on forest conservation:
        
        User Question: {message}
        
        {f"Location Context: {location}" if location else ""}
        {f"Recent News Headlines: {chr(10).join([f'- {news.get('title', '')}' for news in news_data[:3]])}" if news_data else ""}
        
        Provide a helpful response that:
        1. Addresses the question directly
        2. Uses simple, clear language
        3. Provides practical insights
        4. Suggests actionable steps if relevant
        5. Links to relevant SDGs
        6. Incorporates any available news context
        
        Keep the response conversational and easy to understand.
        '''
        
        response = model.generate_content(chat_prompt)
        return response.text
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return "Sorry, there was an error processing your question. Please try again.", 500



if __name__ == "__main__":
    if not os.getenv('GEMINI_API_KEY'):
        print("WARNING: GEMINI_API_KEY not found in environment variables")
    print("Starting Flask server...")
    print("Available endpoints:")
    print("  - http://localhost:5000/")
    print("  - http://localhost:5000/data/available-locations")
    print("  - http://localhost:5000/data/state/<state_name>/<density>")
    print("  - http://localhost:5000/data/district/<district_name>/<density>")
    print("  - http://localhost:5000/data/india/<density>")
    print("  - http://localhost:5000/data/densities?location=<location>")
    print("  - http://localhost:5000/data/analyze/<location>/<density>")
    print("  - http://localhost:5000/api/analyze")
    print("  - http://localhost:5000/api/chat")
    app.run(debug=True, port=5000, host='0.0.0.0')
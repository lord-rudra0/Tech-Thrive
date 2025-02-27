import pandas as pd
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all domains on all routes
CORS(app, resources={r"/*": {"origins": "*"}})

def format_value(value, unit):
    if pd.isna(value): return "No data"
    if abs(value) >= 1e9: return f"{value/1e9:,.2f} B {unit}"
    elif abs(value) >= 1e6: return f"{value/1e6:,.2f} M {unit}"
    elif abs(value) >= 1e3: return f"{value/1e3:,.2f} K {unit}"
    return f"{value:,.2f} {unit}"

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
            "densities": "/data/densities?location=<location>"
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

if __name__ == "__main__":
    print("Starting Flask server...")
    print("Available endpoints:")
    print("  - http://localhost:5000/")
    print("  - http://localhost:5000/data/available-locations")
    print("  - http://localhost:5000/data/state/<state_name>/<density>")
    print("  - http://localhost:5000/data/district/<district_name>/<density>")
    print("  - http://localhost:5000/data/india/<density>")
    print("  - http://localhost:5000/data/densities?location=<location>")
    app.run(debug=True, port=5000, host='0.0.0.0')
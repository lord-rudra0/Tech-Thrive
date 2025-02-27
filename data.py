import pandas as pd
import numpy as np
from tabulate import tabulate

def format_value(value, unit):
    """Format large numbers into K, M, B format with units"""
    if pd.isna(value):
        return "No data"
    
    if abs(value) >= 1e9:
        return f"{value/1e9:,.2f} B {unit}"
    elif abs(value) >= 1e6:
        return f"{value/1e6:,.2f} M {unit}"
    elif abs(value) >= 1e3:
        return f"{value/1e3:,.2f} K {unit}"
    else:
        return f"{value:,.2f} {unit}"

def analyze_forest_data(location, density_threshold=None):
    try:
        # Read both sheets
        carbon_data = pd.read_excel('C:/Users/prata/Tech-Thrive/IND.xlsx', 
                                  sheet_name='Subnational 2 carbon data')
        
        # Check if we're looking for district or state data
        if location.lower() in [str(x).lower() for x in carbon_data['district'].dropna()]:
            location_type = 'district'
        elif location.lower() in [str(x).lower() for x in carbon_data['state'].dropna()]:
            location_type = 'state'
            # Switch to Subnational 1 data for states
            carbon_data = pd.read_excel('C:/Users/prata/Tech-Thrive/IND.xlsx', 
                                      sheet_name='Subnational 1 carbon data')
        else:
            return "Location not found in the database."

        # Filter data for the specified location
        carbon_loc_data = carbon_data[carbon_data[location_type].str.contains(location, case=False, na=False)]

        if carbon_loc_data.empty:
            return "No data found for the specified location."

        # Get available density thresholds for this location
        available_densities = sorted(carbon_loc_data['umd_tree_cover_density_2000__threshold'].unique())
        
        # If no density threshold specified, return available options
        if density_threshold is None:
            return {
                'location': location,
                'location_type': location_type,
                'available_densities': available_densities
            }

        # Filter for specific density threshold
        density_data = carbon_loc_data[
            carbon_loc_data['umd_tree_cover_density_2000__threshold'] == density_threshold
        ]

        if density_data.empty:
            return f"No data found for density threshold {density_threshold}%"

        row_data = density_data.iloc[0]

        # Basic stats
        stats = {
            'Tree Cover Area': {
                'value': row_data['umd_tree_cover_extent_2000__ha'],
                'formatted': format_value(row_data['umd_tree_cover_extent_2000__ha'], 'hectares'),
                'unit': 'ha'
            },
            'Carbon Stocks': {
                'value': row_data['gfw_aboveground_carbon_stocks_2000__Mg_C'],
                'formatted': format_value(row_data['gfw_aboveground_carbon_stocks_2000__Mg_C'], 'Mg C'),
                'unit': 'Mg C'
            },
            'Carbon Density': {
                'value': row_data['avg_gfw_aboveground_carbon_stocks_2000__Mg_C_ha-1'],
                'formatted': format_value(row_data['avg_gfw_aboveground_carbon_stocks_2000__Mg_C_ha-1'], 'Mg C/ha'),
                'unit': 'Mg C/ha'
            }
        }
        
        # Yearly emissions data
        yearly_data = {}
        for year in range(2001, 2024):
            col = f'gfw_forest_carbon_gross_emissions_{year}__Mg_CO2e'
            if col in row_data:
                yearly_data[year] = {
                    'value': row_data[col],
                    'formatted': format_value(row_data[col], 'Mg CO₂e'),
                    'unit': 'Mg CO₂e'
                }

        return {
            'location': location,
            'location_type': location_type,
            'density_threshold': density_threshold,
            'baseline_stats': stats,
            'yearly_data': yearly_data
        }

    except Exception as e:
        import traceback
        print("Full error:", traceback.format_exc())
        return f"Error: {str(e)}"

def display_results(data):
    if isinstance(data, str):
        print(data)
        return

    # If no density threshold was specified, show available options
    if 'available_densities' in data:
        print(f"\nAvailable density thresholds for {data['location']} ({data['location_type']}):")
        print("=" * 80)
        print("\nDensity thresholds (%): " + ", ".join(map(str, data['available_densities'])))
        print("\nPlease select a density threshold to view detailed data.")
        return

    print(f"\nForest Carbon Analysis for {data['location']} ({data['location_type']})")
    print(f"Tree Cover Density Threshold: {data['density_threshold']}%")
    print("=" * 80)
    
    # Display baseline statistics
    print("\nBaseline Statistics (Year 2000):")
    print("-" * 80)
    baseline_data = []
    for metric, info in data['baseline_stats'].items():
        baseline_data.append([metric, info['formatted']])
    print(tabulate(baseline_data, headers=['Metric', 'Value'], 
                  tablefmt='grid'))

    # Display yearly emissions if available
    if data['yearly_data']:
        print("\nYearly Forest Carbon Emissions (2001-2023):")
        print("-" * 80)
        yearly_rows = []
        for year in sorted(data['yearly_data'].keys()):
            year_data = data['yearly_data'][year]
            yearly_rows.append([year, year_data['formatted']])
        
        print(tabulate(yearly_rows, 
                      headers=['Year', 'Emissions'],
                      tablefmt='grid'))

    # Add insights
    print("\nKey Insights:")
    stats = data['baseline_stats']
    print(f"1. Forest Coverage: At {data['density_threshold']}% density threshold, {data['location']} has {stats['Tree Cover Area']['formatted']} of forest cover")
    print(f"2. Carbon Storage: These forests store {stats['Carbon Stocks']['formatted']} of carbon")
    print(f"3. Storage Efficiency: The average carbon density is {stats['Carbon Density']['formatted']}")

def main():
    while True:
        location = input("\nEnter the name of an Indian district or state (or 'quit' to exit): ")
        if location.lower() == 'quit':
            break
        
        # First get available density thresholds
        result = analyze_forest_data(location)
        display_results(result)
        
        if isinstance(result, str):
            continue
            
        if 'available_densities' in result:
            while True:
                density_input = input("\nEnter density threshold (or 'back' to choose different location): ")
                if density_input.lower() == 'back':
                    break
                try:
                    density = float(density_input)
                    if density in result['available_densities']:
                        detailed_result = analyze_forest_data(location, density)
                        display_results(detailed_result)
                    else:
                        print(f"\nInvalid density threshold. Available options: {', '.join(map(str, result['available_densities']))}")
                except ValueError:
                    print("\nPlease enter a valid number for density threshold")

if __name__ == "__main__":
    main()
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
        tree_data_state = pd.read_excel('C:/Users/prata/Tech-Thrive/IND.xlsx', 
                                  sheet_name='Subnational 1 tree cover loss')
        tree_data_district = pd.read_excel('C:/Users/prata/Tech-Thrive/IND.xlsx', 
                                  sheet_name='Subnational 2 tree cover loss')
        
        india_data_carbon = pd.read_excel('C:/Users/prata/Tech-Thrive/IND.xlsx', 
                                  sheet_name='Country carbon data')
        
        india_data_tree = pd.read_excel('C:/Users/prata/Tech-Thrive/IND.xlsx', 
                                  sheet_name='Country tree cover loss')
        
        print("\nColumns in Country carbon data sheet:")
        print("=" * 80)
        for col in india_data_tree.columns:
            print(col)
        
        
        # Check if we're looking for district or state data
        if location.lower() in [str(x).lower() for x in carbon_data['district'].dropna()]:
            location_type = 'district'
            tree_data = tree_data_district
        elif location.lower() in [str(x).lower() for x in carbon_data['state'].dropna()]:
            location_type = 'state'
            tree_data = tree_data_state
            # Switch to Subnational 1 data for states
            carbon_data = pd.read_excel('C:/Users/prata/Tech-Thrive/IND.xlsx', 
                                      sheet_name='Subnational 1 carbon data')
        else:
            return "Location not found in the database."

        # Filter data for the specified location
        carbon_loc_data = carbon_data[carbon_data[location_type].str.contains(location, case=False, na=False)]
        tree_loc_data = tree_data[tree_data[location_type].str.contains(location, case=False, na=False)]

        if carbon_loc_data.empty or tree_loc_data.empty:
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
        tree_density_data = tree_loc_data[
            tree_loc_data['threshold'] == density_threshold
        ]

        if density_data.empty or tree_density_data.empty:
            return f"No data found for density threshold {density_threshold}%"

        row_data = density_data.iloc[0]
        tree_row_data = tree_density_data.iloc[0]

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
            },
            'Tree Cover Extent 2000': {
                'value': tree_row_data['extent_2000_ha'],
                'formatted': format_value(tree_row_data['extent_2000_ha'], 'hectares'),
                'unit': 'ha'
            },
            'Tree Cover Extent 2010': {
                'value': tree_row_data['extent_2010_ha'],
                'formatted': format_value(tree_row_data['extent_2010_ha'], 'hectares'),
                'unit': 'ha'
            },
            'Tree Cover Gain (2000-2020)': {
                'value': tree_row_data['gain_2000-2020_ha'],
                'formatted': format_value(tree_row_data['gain_2000-2020_ha'], 'hectares'),
                'unit': 'ha'
            }
        }
        
        # Yearly tree cover loss data
        yearly_tree_loss = {}
        for year in range(2001, 2024):
            col = f'tc_loss_ha_{year}'
            if col in tree_row_data:
                yearly_tree_loss[year] = {
                    'value': tree_row_data[col],
                    'formatted': format_value(tree_row_data[col], 'hectares'),
                    'unit': 'ha'
                }

        # Yearly emissions data
        yearly_emissions = {}
        for year in range(2001, 2024):
            col = f'gfw_forest_carbon_gross_emissions_{year}__Mg_CO2e'
            if col in row_data:
                yearly_emissions[year] = {
                    'value': row_data[col],
                    'formatted': format_value(row_data[col], 'Mg CO₂e'),
                    'unit': 'Mg CO₂e'
                }

        return {
            'location': location,
            'location_type': location_type,
            'density_threshold': density_threshold,
            'baseline_stats': stats,
            'yearly_emissions': yearly_emissions,
            'yearly_tree_loss': yearly_tree_loss
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

    print(f"\nForest Analysis for {data['location']} ({data['location_type']})")
    print(f"Tree Cover Density Threshold: {data['density_threshold']}%")
    print("=" * 80)
    
    # Display Forest Statistics
    print("\nForest Statistics:")
    print("-" * 80)
    forest_stats = [
        ['Tree Cover Extent 2000', data['baseline_stats']['Tree Cover Extent 2000']['formatted']],
        ['Tree Cover Extent 2010', data['baseline_stats']['Tree Cover Extent 2010']['formatted']],
        ['Tree Cover Gain (2000-2020)', data['baseline_stats']['Tree Cover Gain (2000-2020)']['formatted']]
    ]
    print(tabulate(forest_stats, headers=['Metric', 'Value'], tablefmt='grid'))

    # Display Carbon Statistics
    print("\nCarbon Statistics:")
    print("-" * 80)
    carbon_stats = [
        ['Carbon Stocks', data['baseline_stats']['Carbon Stocks']['formatted']],
        ['Carbon Density', data['baseline_stats']['Carbon Density']['formatted']]
    ]
    print(tabulate(carbon_stats, headers=['Metric', 'Value'], tablefmt='grid'))

    # Display yearly data in two separate tables
    if data['yearly_tree_loss']:
        # Forest Loss Table
        print("\nYearly Tree Cover Loss (2001-2023):")
        print("-" * 80)
        forest_rows = []
        total_loss = 0
        max_loss_year = None
        max_loss = 0
        
        for year in sorted(data['yearly_tree_loss'].keys()):
            loss_value = data['yearly_tree_loss'][year]['value']
            if not pd.isna(loss_value):
                total_loss += loss_value
                if loss_value > max_loss:
                    max_loss = loss_value
                    max_loss_year = year
            forest_rows.append([
                year,
                data['yearly_tree_loss'][year]['formatted']
            ])
        
        print(tabulate(forest_rows, headers=['Year', 'Tree Cover Loss'], tablefmt='grid'))

        # Carbon Emissions Table
        print("\nYearly Carbon Emissions (2001-2023):")
        print("-" * 80)
        carbon_rows = []
        total_emissions = 0
        max_emissions_year = None
        max_emissions = 0
        
        for year in sorted(data['yearly_emissions'].keys()):
            emissions_data = data['yearly_emissions'].get(year, {'value': 0, 'formatted': 'No data'})
            if not pd.isna(emissions_data['value']):
                total_emissions += emissions_data['value']
                if emissions_data['value'] > max_emissions:
                    max_emissions = emissions_data['value']
                    max_emissions_year = year
            carbon_rows.append([
                year,
                emissions_data['formatted']
            ])
        
        print(tabulate(carbon_rows, headers=['Year', 'Carbon Emissions'], tablefmt='grid'))

    # Comprehensive Analysis
    print("\nComprehensive Analysis:")
    print("=" * 80)
    stats = data['baseline_stats']
    
    # Forest Cover Change Analysis
    extent_2000 = stats['Tree Cover Extent 2000']['value']
    extent_2010 = stats['Tree Cover Extent 2010']['value']
    gain_2020 = stats['Tree Cover Gain (2000-2020)']['value']
    
    decade_change = extent_2010 - extent_2000
    decade_change_percent = (decade_change / extent_2000 * 100) if extent_2000 != 0 else 0
    
    print("\n1. Forest Cover Trends:")
    print(f"   • Initial forest cover (2000): {stats['Tree Cover Extent 2000']['formatted']}")
    print(f"   • Decade change (2000-2010): {format_value(decade_change, 'hectares')} ({decade_change_percent:.1f}%)")
    print(f"   • Total gain (2000-2020): {stats['Tree Cover Gain (2000-2020)']['formatted']}")
    print(f"   • Total loss (2001-2023): {format_value(total_loss, 'hectares')}")
    if max_loss_year:
        print(f"   • Highest annual loss: {format_value(max_loss, 'hectares')} in {max_loss_year}")

    print("\n2. Carbon Storage and Emissions:")
    print(f"   • Total carbon stocks: {stats['Carbon Stocks']['formatted']}")
    print(f"   • Storage efficiency: {stats['Carbon Density']['formatted']}")
    if max_emissions_year:
        print(f"   • Highest emissions: {format_value(max_emissions, 'Mg CO₂e')} in {max_emissions_year}")
    print(f"   • Total emissions (2001-2023): {format_value(total_emissions, 'Mg CO₂e')}")

    print("\n3. Key Findings:")
    # Calculate net forest change
    net_change = gain_2020 - total_loss
    net_change_percent = (net_change / extent_2000 * 100) if extent_2000 != 0 else 0
    
    print(f"   • Net forest change: {format_value(net_change, 'hectares')} ({net_change_percent:.1f}%)")
    print(f"   • Average annual loss: {format_value(total_loss/23, 'hectares')} per year")
    print(f"   • Average carbon density: {stats['Carbon Density']['formatted']}")
    
    # Forest health indicator
    if net_change > 0:
        health_status = "Forest Expansion"
    elif net_change < 0:
        health_status = "Forest Decline"
    else:
        health_status = "Stable Forest"
    
    print(f"   • Forest Health Status: {health_status}")

def analyze_country_data():
    try:
        # Read both country data sheets
        india_data_carbon = pd.read_excel('C:/Users/prata/Tech-Thrive/IND.xlsx', 
                                        sheet_name='Country carbon data')
        india_data_tree = pd.read_excel('C:/Users/prata/Tech-Thrive/IND.xlsx', 
                                      sheet_name='Country tree cover loss')
        
        print("\nAvailable density thresholds for India:")
        print("=" * 80)
        thresholds = sorted(india_data_carbon['umd_tree_cover_density_2000__threshold'].unique())
        print("\nDensity thresholds (%): " + ", ".join(map(str, thresholds)))
        
        density_input = input("\nEnter density threshold: ")
        try:
            density = float(density_input)
            if density not in thresholds:
                return f"Invalid density threshold. Available options: {', '.join(map(str, thresholds))}"
        except ValueError:
            return "Please enter a valid number for density threshold"
            
        # Get India's data for specific density
        india_carbon_row = india_data_carbon[india_data_carbon['umd_tree_cover_density_2000__threshold'] == density]
        india_tree_row = india_data_tree[india_data_tree['threshold'] == density]
        
        if india_carbon_row.empty or india_tree_row.empty:
            return "No data found for India at this density threshold"
            
        carbon_data = india_carbon_row.iloc[0]
        tree_data = india_tree_row.iloc[0]
        
        # Basic stats
        stats = {
            'Tree Cover Area': {
                'value': carbon_data['umd_tree_cover_extent_2000__ha'],
                'formatted': format_value(carbon_data['umd_tree_cover_extent_2000__ha'], 'hectares'),
                'unit': 'ha'
            },
            'Carbon Stocks': {
                'value': carbon_data['gfw_aboveground_carbon_stocks_2000__Mg_C'],
                'formatted': format_value(carbon_data['gfw_aboveground_carbon_stocks_2000__Mg_C'], 'Mg C'),
                'unit': 'Mg C'
            },
            'Carbon Density': {
                'value': carbon_data['avg_gfw_aboveground_carbon_stocks_2000__Mg_C_ha-1'],
                'formatted': format_value(carbon_data['avg_gfw_aboveground_carbon_stocks_2000__Mg_C_ha-1'], 'Mg C/ha'),
                'unit': 'Mg C/ha'
            },
            'Tree Cover Extent 2000': {
                'value': tree_data['extent_2000_ha'],
                'formatted': format_value(tree_data['extent_2000_ha'], 'hectares'),
                'unit': 'ha'
            },
            'Tree Cover Extent 2010': {
                'value': tree_data['extent_2010_ha'],
                'formatted': format_value(tree_data['extent_2010_ha'], 'hectares'),
                'unit': 'ha'
            },
            'Tree Cover Gain (2000-2020)': {
                'value': tree_data['gain_2000-2020_ha'],
                'formatted': format_value(tree_data['gain_2000-2020_ha'], 'hectares'),
                'unit': 'ha'
            }
        }
        
        # Yearly tree cover loss data
        yearly_tree_loss = {}
        for year in range(2001, 2024):
            col = f'tc_loss_ha_{year}'
            if col in tree_data.index:
                yearly_tree_loss[year] = {
                    'value': tree_data[col],
                    'formatted': format_value(tree_data[col], 'hectares'),
                    'unit': 'ha'
                }

        # Yearly emissions data
        yearly_emissions = {}
        for year in range(2001, 2024):
            col = f'gfw_forest_carbon_gross_emissions_{year}__Mg_CO2e'
            if col in carbon_data.index:
                yearly_emissions[year] = {
                    'value': carbon_data[col],
                    'formatted': format_value(carbon_data[col], 'Mg CO₂e'),
                    'unit': 'Mg CO₂e'
                }
                
        return {
            'density_threshold': density,
            'baseline_stats': stats,
            'yearly_emissions': yearly_emissions,
            'yearly_tree_loss': yearly_tree_loss
        }
        
    except Exception as e:
        import traceback
        print("Full error:", traceback.format_exc())
        return f"Error: {str(e)}"

def display_country_results(data):
    if isinstance(data, str):
        print(data)
        return
        
    print(f"\nIndia's National Forest Carbon Analysis (Density Threshold: {data['density_threshold']}%)")
    print("=" * 80)
    
    # Display Forest Statistics
    print("\nForest Statistics:")
    print("-" * 80)
    forest_stats = [
        ['Tree Cover Extent 2000', data['baseline_stats']['Tree Cover Extent 2000']['formatted']],
        ['Tree Cover Extent 2010', data['baseline_stats']['Tree Cover Extent 2010']['formatted']],
        ['Tree Cover Gain (2000-2020)', data['baseline_stats']['Tree Cover Gain (2000-2020)']['formatted']]
    ]
    print(tabulate(forest_stats, headers=['Metric', 'Value'], tablefmt='grid'))

    # Display Carbon Statistics
    print("\nCarbon Statistics:")
    print("-" * 80)
    carbon_stats = [
        ['Carbon Stocks', data['baseline_stats']['Carbon Stocks']['formatted']],
        ['Carbon Density', data['baseline_stats']['Carbon Density']['formatted']]
    ]
    print(tabulate(carbon_stats, headers=['Metric', 'Value'], tablefmt='grid'))

    # Display yearly data in two separate tables
    if data['yearly_tree_loss']:
        # Forest Loss Table
        print("\nYearly Tree Cover Loss (2001-2023):")
        print("-" * 80)
        forest_rows = []
        total_loss = 0
        max_loss_year = None
        max_loss = 0
        
        for year in sorted(data['yearly_tree_loss'].keys()):
            loss_value = data['yearly_tree_loss'][year]['value']
            if not pd.isna(loss_value):
                total_loss += loss_value
                if loss_value > max_loss:
                    max_loss = loss_value
                    max_loss_year = year
            forest_rows.append([
                year,
                data['yearly_tree_loss'][year]['formatted']
            ])
        
        print(tabulate(forest_rows, headers=['Year', 'Tree Cover Loss'], tablefmt='grid'))

        # Carbon Emissions Table
        print("\nYearly Carbon Emissions (2001-2023):")
        print("-" * 80)
        carbon_rows = []
        total_emissions = 0
        max_emissions_year = None
        max_emissions = 0
        
        for year in sorted(data['yearly_emissions'].keys()):
            emissions_data = data['yearly_emissions'].get(year, {'value': 0, 'formatted': 'No data'})
            if not pd.isna(emissions_data['value']):
                total_emissions += emissions_data['value']
                if emissions_data['value'] > max_emissions:
                    max_emissions = emissions_data['value']
                    max_emissions_year = year
            carbon_rows.append([
                year,
                emissions_data['formatted']
            ])
        
        print(tabulate(carbon_rows, headers=['Year', 'Carbon Emissions'], tablefmt='grid'))

    # Comprehensive Analysis
    print("\nNational Level Analysis:")
    print("=" * 80)
    stats = data['baseline_stats']
    
    # Forest Cover Change Analysis
    extent_2000 = stats['Tree Cover Extent 2000']['value']
    extent_2010 = stats['Tree Cover Extent 2010']['value']
    gain_2020 = stats['Tree Cover Gain (2000-2020)']['value']
    
    decade_change = extent_2010 - extent_2000
    decade_change_percent = (decade_change / extent_2000 * 100) if extent_2000 != 0 else 0
    
    print("\n1. Forest Cover Trends:")
    print(f"   • Initial forest cover (2000): {stats['Tree Cover Extent 2000']['formatted']}")
    print(f"   • Decade change (2000-2010): {format_value(decade_change, 'hectares')} ({decade_change_percent:.1f}%)")
    print(f"   • Total gain (2000-2020): {stats['Tree Cover Gain (2000-2020)']['formatted']}")
    print(f"   • Total loss (2001-2023): {format_value(total_loss, 'hectares')}")
    if max_loss_year:
        print(f"   • Highest annual loss: {format_value(max_loss, 'hectares')} in {max_loss_year}")

    print("\n2. Carbon Storage and Emissions:")
    print(f"   • Total carbon stocks: {stats['Carbon Stocks']['formatted']}")
    print(f"   • Storage efficiency: {stats['Carbon Density']['formatted']}")
    if max_emissions_year:
        print(f"   • Highest emissions: {format_value(max_emissions, 'Mg CO₂e')} in {max_emissions_year}")
    print(f"   • Total emissions (2001-2023): {format_value(total_emissions, 'Mg CO₂e')}")

    print("\n3. Key Findings:")
    # Calculate net forest change
    net_change = gain_2020 - total_loss
    net_change_percent = (net_change / extent_2000 * 100) if extent_2000 != 0 else 0
    
    print(f"   • Net forest change: {format_value(net_change, 'hectares')} ({net_change_percent:.1f}%)")
    print(f"   • Average annual loss: {format_value(total_loss/23, 'hectares')} per year")
    print(f"   • Average carbon density: {stats['Carbon Density']['formatted']}")
    
    # Forest health indicator
    if net_change > 0:
        health_status = "Forest Expansion"
    elif net_change < 0:
        health_status = "Forest Decline"
    else:
        health_status = "Stable Forest"
    
    print(f"   • Forest Health Status: {health_status}")

def main():
    while True:
        print("\nOptions:")
        print("1. Analyze State/District Data")
        print("2. View National (India) Data")
        print("3. Quit")
        
        choice = input("\nEnter your choice (1-3): ")
        
        if choice == '3':
            break
        elif choice == '2':
            result = analyze_country_data()
            display_country_results(result)
        elif choice == '1':
            location = input("\nEnter the name of an Indian district or state (or 'back' to return to menu): ")
            if location.lower() == 'back':
                continue
                
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
        else:
            print("\nInvalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main()
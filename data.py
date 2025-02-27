import pandas as pd
import requests
from io import StringIO

# Sample dataset as a CSV string
csv_data = StringIO("""
date,city,state,value
2023-10-01,New York,NY,100
2023-09-15,Los Angeles,CA,200
2023-10-01,Chicago,IL,150
2023-09-20,Houston,TX,120
2023-10-01,Los Angeles,CA,180
""")

# Step 1: Read the dataset
data = pd.read_csv(csv_data) 

# Step 2: Sort the data by date, city, and state
sorted_data = data.sort_values(by=['date', 'city', 'state'])

# Step 3: Send the sorted data to an Express server
url = 'http://your-express-server-url/endpoint'  # Update with your server URL
headers = {'Content-Type': 'application/json'}
response = requests.post(url, json=sorted_data.to_dict(orient='records'), headers=headers)

# Check the response from the server
if response.status_code == 200:
    print('Data sent successfully!')
else:
    print('Failed to send data:', response.status_code, response.text)

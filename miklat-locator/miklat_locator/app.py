# app.py
from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__, static_folder="../build", static_url_path='/')

@app.route('/api/locations')
def get_locations():
    print("TESTING get_locations!!!!!")
    data = pd.read_csv('miklat.csv')  # Assuming your CSV file is named 'locations.csv'
    locations_list = data.to_dict(orient='records')  # Convert DataFrame to list of dictionaries
    locations_list = [dict(name=d['name'], location=dict(lng=d['lng'], lat=d['lat'])) for d in locations_list]
    # d = dict(name='test1',lat=31.802924199503284, lng=35.21291838171276)
    # locations_list = [dict(name=d['name'], address=dict(lng=d['lng'], lat=d['lat'])) ]
    
    return jsonify(locations_list)

@app.route('/')
def index():
    print("TESTING index!!!!!")
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True)
    app.run()

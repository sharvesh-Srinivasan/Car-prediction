from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import os

app = Flask(__name__)
CORS(app)

# Load model and preprocessors
try:
    rf_model = joblib.load('rf_model.pkl')
    encoder = joblib.load('encoder.pkl')
    scaler = joblib.load('scaler.pkl')
except Exception as e:
    rf_model = encoder = scaler = None
    print("Model or preprocessors could not be loaded:", e)

categorical_features = ['brand', 'fuel_type', 'transmission', 'ext_col', 'int_col', 'cylinders', 'model']
continious_feature = ['milage', 'age', 'horse_power', 'liter_capacity', 'gear']

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not (rf_model and encoder and scaler):
        return jsonify({'error': 'Model or preprocessors not loaded'}), 500

    data = request.get_json()
    try:
        age = 2025 - int(data['model_year'])
        custom_map = {
            'None reported': 1,
            'At least 1 accident or damage reported': 0
        }
        accident = custom_map.get(data['accident'], 0)
        clean_title = True if data['clean_title'] == 'Yes' else False

        input_dict = {
            'brand': data['brand'],
            'model': data['model'],
            'milage': int(data['milage']),
            'fuel_type': data['fuel_type'],
            'transmission': data['transmission'],
            'cylinders': int(data['cylinders']),
            'horse_power': float(data['horse_power']),
            'liter_capacity': float(data['liter_capacity']),
            'gear': int(data['gear']),
            'accident': accident,
            'clean_title': clean_title,
            'ext_col': data.get('ext_col', 'Unknown'),
            'int_col': data.get('int_col', 'Unknown'),
            'age': age,
            'electric': str(data.get('electric', 'False')).lower() == 'true'
        }
        X_input = pd.DataFrame([input_dict])

        # One-hot encode categorical features
        encoded_features = encoder.transform(X_input[categorical_features])
        encoded_car_data = pd.DataFrame(
            encoded_features,
            columns=encoder.get_feature_names_out(categorical_features),
            index=X_input.index
        )
        X_input = pd.concat([X_input, encoded_car_data], axis=1)
        X_input.drop(columns=categorical_features, inplace=True)

        # Scale continuous features
        scaled_feature = scaler.transform(X_input[continious_feature])
        scaled_car_data = pd.DataFrame(
            scaled_feature,
            columns=scaler.get_feature_names_out(continious_feature),
            index=X_input.index
        )
        X_input.drop(columns=continious_feature, inplace=True)
        X_input = pd.concat([X_input, scaled_car_data], axis=1)

        # Predict price
        predicted_price = rf_model.predict(X_input)[0]
        return jsonify({'price': int(predicted_price)})
    except Exception as e:
        print("Prediction error:", e)
        return jsonify({'error': 'Prediction failed', 'details': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
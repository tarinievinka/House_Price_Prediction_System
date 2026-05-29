import os

import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error

# -------------------------------------------------------------------------
# Dynamic Path Configuration (Fixes FileNotFoundError)
# -------------------------------------------------------------------------
# 1. Get the absolute directory path where this script lives (D:/.../src)
script_dir = os.path.dirname(os.path.abspath(__file__))

# 2. Safely jump up to project root, then point straight into the data folder
input_csv_path = os.path.join(script_dir, '..', 'data', 'Housing_Price_Data.csv')
output_csv_path = os.path.join(script_dir, '..', 'data', 'Housing_Prices_with_Predictions.csv')


# 1. Load the dataset using the robust path
df = pd.read_csv(input_csv_path)

# 2. Preprocessing & Encoding Categorical Features
binary_cols = ['mainroad', 'guestroom', 'basement', 'hotwaterheating', 'airconditioning', 'prefarea']
for col in binary_cols:
    df[col] = df[col].map({'yes': 1, 'no': 0})

# One-hot encode the furnishingstatus column
df_encoded = pd.get_dummies(df, columns=['furnishingstatus'], drop_first=True)

# Convert boolean dummy columns to integers (1/0) for clean Power BI handling
for col in df_encoded.columns:
    if df_encoded[col].dtype == 'bool':
        df_encoded[col] = df_encoded[col].astype(int)

# 3. Define Features and Target
X = df_encoded.drop(columns=['price'])
y = df_encoded['price']

# 4. Train the Model
model = LinearRegression()
model.fit(X, y)

# 5. Generate Predictions and Calculate Metrics
y_pred = model.predict(X)
r2 = r2_score(y, y_pred)
mae = mean_absolute_error(y, y_pred)

print(f"Model Training Complete! R² Score: {r2:.2f}")
print(f"Mean Absolute Error: LKR {mae:,.2f}")

# 6. Add predictions back to original layout for Power BI analytics
df['predicted_price'] = np.round(y_pred, 2)
df['prediction_error'] = np.round(df['price'] - df['predicted_price'], 2)

# Export the enriched dataset for Power BI using the robust path
df.to_csv(output_csv_path, index=False)
print("Housing_Prices_with_Predictions.csv has been successfully generated!")

# -------------------------------------------------------------------------
# 7. SAVE THE TRAINED MODEL FOR FASTAPI USE
# -------------------------------------------------------------------------
models_dir = os.path.join(script_dir, '..', 'models')
os.makedirs(models_dir, exist_ok=True)
model_output_path = os.path.join(models_dir, 'house_price_regressor.pkl')

joblib.dump(model, model_output_path)
print(f"Production model successfully saved to: {model_output_path}")
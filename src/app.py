import os
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Real Estate Price Prediction API")

# Enable CORS so your Frontend layout can talk to your backend safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, swap with your exact React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Locate and load the saved model file dynamically
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, '..', 'models', 'house_price_regressor.pkl')
model = joblib.load(model_path)


# Define the structure of the incoming data from the React frontend form
class HouseFeatures(BaseModel):
    area: float
    bedrooms: int
    bathrooms: int
    stories: int
    mainroad: int  # 1 for Yes, 0 for No
    guestroom: int  # 1 for Yes, 0 for No
    basement: int  # 1 for Yes, 0 for No
    hotwaterheating: int  # 1 for Yes, 0 for No
    airconditioning: int  # 1 for Yes, 0 for No
    parking: int
    prefarea: int  # 1 for Yes, 0 for No
    furnishingstatus_semi_furnished: int  # 1 if semi-furnished, else 0
    furnishingstatus_unfurnished: int  # 1 if unfurnished, else 0


@app.post("/predict")
def predict_price(data: HouseFeatures):
    # 1. Convert incoming JSON data into a dictionary layout
    input_data = data.model_dump()

    # so they exactly match what scikit-learn saw during model training!
    input_data['furnishingstatus_semi-furnished'] = input_data.pop('furnishingstatus_semi_furnished')
    input_data['furnishingstatus_unfurnished'] = input_data.pop('furnishingstatus_unfurnished')
    # 2. Convert dictionary to a DataFrame format matching scikit-learn's expectations
    input_df = pd.DataFrame([input_data])

    # 3. Compute prediction using our loaded model weights
    prediction = model.predict(input_df)[0]

    # 4. Return the exact predicted amount cleanly as JSON
    return {
        "estimated_price": round(float(prediction), 2),
        "currency": "LKR"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
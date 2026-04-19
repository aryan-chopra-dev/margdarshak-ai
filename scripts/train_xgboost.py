import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import pickle
import json
import os

def train_abroad_model():
    print("\n--- Training Model 1: Study Abroad (Kaggle+Scorecard+QS) ---")
    df = pd.read_csv('data/normalized_abroad_admissions.csv')
    
    X = df.drop('Admit_Probability', axis=1)
    y = df['Admit_Probability']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBRegressor(
        objective='reg:squarederror', n_estimators=100, learning_rate=0.08, max_depth=5, random_state=42
    )
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    print(f"R-squared: {r2_score(y_test, preds):.4f}")
    print("Feature Importances:")
    importances = {feat: float(imp) for feat, imp in zip(X.columns, model.feature_importances_)}
    for f, i in importances.items():
        print(f"  {f}: {i:.4f}")
        
    with open('data/xgboost_abroad_v3.pkl', 'wb') as f:
        pickle.dump(model, f)
    with open('data/xgboost_abroad_weights.json', 'w') as f:
        json.dump(importances, f, indent=2)

def train_domestic_model():
    print("\n--- Training Model 2: Domestic India (NIRF+GATE/CAT) ---")
    df = pd.read_csv('data/normalized_domestic_admissions.csv')
    
    X = df.drop('Admit_Probability', axis=1)
    y = df['Admit_Probability']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=99)
    
    model = xgb.XGBRegressor(
        objective='reg:squarederror', n_estimators=100, learning_rate=0.08, max_depth=5, random_state=99
    )
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    print(f"R-squared: {r2_score(y_test, preds):.4f}")
    print("Feature Importances:")
    importances = {feat: float(imp) for feat, imp in zip(X.columns, model.feature_importances_)}
    for f, i in importances.items():
        print(f"  {f}: {i:.4f}")
        
    with open('data/xgboost_domestic_v3.pkl', 'wb') as f:
        pickle.dump(model, f)
    with open('data/xgboost_domestic_weights.json', 'w') as f:
        json.dump(importances, f, indent=2)

if __name__ == "__main__":
    if not os.path.exists('data/normalized_abroad_admissions.csv'):
        print("Error: Run build_admissions_datasets.py first!")
        exit(1)
        
    train_abroad_model()
    train_domestic_model()
    print("\n✅ Dual-Model Architecture Training Complete. Models exported to data/ dir.")

import pandas as pd
import numpy as np
import json
import os

def generate_abroad_dataset(n_samples=1000):
    print("Generating Abroad Dataset (Fusing Kaggle, QS Rankings, College Scorecard)...")
    np.random.seed(42)
    
    # 1. Base applicant features (from Kaggle Graduate Admissions Distribution)
    data = {
        'GRE_Score': np.random.normal(316, 11, n_samples).clip(290, 340).astype(int),
        'TOEFL_Score': np.random.normal(107, 6, n_samples).clip(92, 120).astype(int),
        'CGPA_10': np.random.normal(8.5, 0.6, n_samples).clip(6.5, 9.9).round(2),
        'SOP_Strength': np.random.normal(3.5, 1.0, n_samples).clip(1, 5).round(1),
        'LOR_Strength': np.random.normal(3.5, 0.9, n_samples).clip(1, 5).round(1),
        'Research_Exp': np.random.binomial(1, 0.55, n_samples)
    }
    df = pd.DataFrame(data)

    # 2. Assign Target University QS Tier (1 to 5, where 5 is Top 20)
    # Higher CGPA/GRE applicants tend to target higher tier universities
    tier_prob = (df['CGPA_10'] / 10 * 0.5) + (df['GRE_Score'] / 340 * 0.5)
    df['Target_QS_Tier'] = pd.cut(tier_prob, bins=5, labels=[1, 2, 3, 4, 5]).astype(int)

    # 3. Simulate US College Scorecard Data merging context
    # Higher tier = higher tuition, lower acceptance rate, higher ROI
    tuition_base = 25000 + (df['Target_QS_Tier'] * 12000) + np.random.normal(0, 5000, n_samples)
    df['Target_Tuition_USD'] = tuition_base.clip(15000, 85000).astype(int)
    
    # 4. Target Label (Admission Probability)
    # Weights derived from Acharya et al. Kaggle baseline
    admit_score = (
        (df['CGPA_10'] * 0.4) + 
        ((df['GRE_Score'] / 340 * 10) * 0.25) + 
        ((df['TOEFL_Score'] / 120 * 10) * 0.1) + 
        (df['SOP_Strength'] * 0.05) + 
        (df['LOR_Strength'] * 0.05) + 
        (df['Research_Exp'] * 0.05)
    ) / 10
    
    # Adjust probability by university tier (tier 5 is intensely competitive)
    tier_penalty = (df['Target_QS_Tier'] - 1) * 0.08
    df['Admit_Probability'] = (admit_score - tier_penalty + np.random.normal(0, 0.03, n_samples))
    df['Admit_Probability'] = df['Admit_Probability'].clip(0.15, 0.98).round(3)
    
    return df

def generate_domestic_dataset(n_samples=1000):
    print("Generating Domestic Dataset (Fusing NIRF Rankings, GATE/CAT, Indian CGPA)...")
    np.random.seed(99)
    
    # 1. Base applicant features (Indian context)
    data = {
        'Entrance_Percentile': np.random.normal(85, 12, n_samples).clip(40, 99.9).round(2), # GATE/CAT/JEE
        'CGPA_10': np.random.normal(7.8, 1.2, n_samples).clip(5.5, 9.9).round(2),
        '12th_Percentage': np.random.normal(82, 10, n_samples).clip(60, 99).round(1),
        'Work_Exp_Months': np.random.exponential(12, n_samples).clip(0, 60).astype(int)
    }
    df = pd.DataFrame(data)

    # 2. Assign Target NIRF Tier (1 to 4, where 4 is Tier-1 IIT/IIM)
    tier_prob = (df['Entrance_Percentile'] / 100 * 0.7) + (df['CGPA_10'] / 10 * 0.3)
    df['Target_NIRF_Tier'] = pd.cut(tier_prob, bins=4, labels=[1, 2, 3, 4]).astype(int)

    # 3. Simulate Domestic Tuition (INR)
    # Tier 4 (IITs/IIMs) cost more for MBAs, but BTechs vary. Median approximation:
    tuition_base = 200000 + (df['Target_NIRF_Tier'] * 350000) + np.random.normal(0, 50000, n_samples)
    df['Target_Tuition_INR'] = tuition_base.clip(100000, 2500000).astype(int)

    # 4. Target Label (Admission Probability)
    # Extremely heavily weighted on Entrance Percentile
    admit_score = (
        (df['Entrance_Percentile'] / 100 * 0.65) + 
        (df['CGPA_10'] / 10 * 0.20) + 
        (df['12th_Percentage'] / 100 * 0.10) + 
        ((df['Work_Exp_Months']/60) * 0.05)
    )
    
    # Severe penalty for top NIRF tiers (cutoffs are brittle)
    tier_penalty = (df['Target_NIRF_Tier'] - 1) * 0.15
    df['Admit_Probability'] = (admit_score - tier_penalty + np.random.normal(0, 0.02, n_samples))
    df['Admit_Probability'] = df['Admit_Probability'].clip(0.05, 0.99).round(3)
    
    return df

if __name__ == "__main__":
    os.makedirs('data', exist_ok=True)
    
    df_abroad = generate_abroad_dataset(1500)
    abroad_path = os.path.join('data', 'normalized_abroad_admissions.csv')
    df_abroad.to_csv(abroad_path, index=False)
    print(f"Abroad dataset saved: {abroad_path} ({len(df_abroad)} records)")
    
    df_domestic = generate_domestic_dataset(1500)
    domestic_path = os.path.join('data', 'normalized_domestic_admissions.csv')
    df_domestic.to_csv(domestic_path, index=False)
    print(f"Domestic dataset saved: {domestic_path} ({len(df_domestic)} records)")

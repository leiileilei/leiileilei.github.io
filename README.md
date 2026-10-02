# GLM7 Depressive Symptom Probability Calculator

This static research application applies the frozen NHANES Logistic prediction pipeline to estimate the probability of **currently having clinically relevant depressive symptoms indicated by PHQ-9 ≥10**. The analysis is cross-sectional; the output is neither a clinical diagnosis nor a forecast of future disease.

## Frozen prediction model

- Analytic cohort: 8,387 participants; training set: 5,870; held-out test set: 2,517.
- Nine predictors: GLM7, sex, educational attainment, marital status, family size, current smoking, alcohol use, physician-diagnosed hypertension, and physician-diagnosed diabetes.
- Physical activity is not a predictor in the final model.
- Twenty imputation-specific, unpenalized Logistic fits are retained. Every fit uses its own frozen training centers and scales for all nine predictors.
- Compute each fit's raw probability, clip each to `[1e-6, 1 - 1e-6]`, and average the twenty probabilities. Apply the frozen Platt transformation to the mean probability; do not average coefficients or recalibrate in the visitor's browser.
- Frozen Platt intercept: `-0.15803762623025`; slope: `0.930304372734924`.

The coefficients and scaling constants were exported from `Logistic_all_final_coefficients_and_scalers.csv`; calibration and threshold constants came from the `GLM7_Logistic` row of `Logistic_final_prediction_settings.csv`. These are the final manuscript model outputs, not the coefficients of the association-analysis Model 3.

## Inputs and coding

GLM7 is calculated as `log10[(age × BMI × fasting glucose × insulin × triglycerides × LDL-C) / HDL-C]`.

| Input | Units or coding |
|---|---|
| Age | Whole years, 45 or older. Ages 80 and older are coded as 80 before calculating GLM7. |
| BMI | kg/m² |
| Fasting glucose | mg/dL |
| Insulin | pmol/L, on the assay scale used for the study's GLM7 calculation |
| Triglycerides, LDL-C, HDL-C | mmol/L |
| Sex | Female = 0; male = 1 |
| Education | Below high school = 0; high school or above = 1 |
| Marital status | Unmarried/other = 0; married = 1 |
| Family size | Integer 1–7; 7 means 7 or more |
| Current smoking | ≥100 lifetime cigarettes and currently smoking every day or some days; no = 0, yes = 1 |
| Alcohol use | Any drinking in the preceding 12 months; no = 0, yes = 1 |
| Hypertension, diabetes | Physician diagnosis; no = 0, yes = 1 |

All inputs are required. The website does not impute missing visitor inputs. A status within the GLM7 training range only describes this feature's range; it does not establish applicability to every population or profile.

## Threshold selection and test interpretation

The operating threshold was chosen **only using training-set, calibrated out-of-fold probabilities** from grouped five-fold cross-validation. The criterion maximizes survey-weighted specificity while retaining survey-weighted sensitivity ≥80%. NHANES fasting subsample survey weights were used. The held-out test set did not select or adjust this threshold.

The exact probability threshold is `0.0534945492990097`, displayed as **5.35%**. Classification uses the exact value and assigns probabilities at or above it to the above-threshold category. This threshold was not chosen with Youden's index.

Survey-weighted held-out test performance:

| Metric | Value |
|---|---:|
| ROC-AUC | 0.714 |
| PR-AUC (weighted average precision) | 0.195 |
| Sensitivity | 81.1% |
| Specificity | 48.3% |
| Positive predictive value | 12.0% |
| Negative predictive value | 96.7% |

Only 12.0% of participants classified above the threshold met PHQ-9 ≥10 in the survey-weighted test analysis; 88.0% did not. An above-threshold result is not a diagnosis, and a below-threshold result does not rule out symptoms. Predictive values are group-level results and depend on the study population and symptom prevalence. The website does not claim calibrated absolute probabilities in CHARLS or other deployment populations.

## Deployment and privacy

The application uses HTML, CSS and JavaScript and is served by GitHub Pages. No backend, database, analytics, or external script is required. Entered values are calculated locally and are not transmitted or stored by this application. Versioned asset URLs avoid mixing the updated model with cached older assets.

The model is intended for research. It does not replace professional clinical assessment or guide treatment decisions.

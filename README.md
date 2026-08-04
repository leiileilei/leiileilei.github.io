# GLM7 Depression Probability Calculator

This static web application applies the frozen 20-model Elastic Net ensemble developed in the NHANES analytical cohort (`n = 8,397`) to estimate concurrent PHQ-9 depressive-symptom probability.

## Model inputs

- GLM7 components: age, BMI, fasting glucose, insulin, triglycerides, LDL-C and HDL-C
- Covariates: gender, education, marital status, family size, smoking, drinking, hypertension, diabetes and physical activity

## Deployment

The application consists only of HTML, CSS and JavaScript and is suitable for GitHub Pages. No server-side computation or database is required.

## Privacy

All calculations are performed locally in the visitor's browser. Entered values are not transmitted to or stored by this application.

## Intended use

This calculator is provided for research and screening purposes only. It does not diagnose depression, replace professional clinical assessment or predict future disease. The underlying analysis was cross-sectional.

## Model integrity

`model_data.js` contains the frozen model coefficients, training-derived scaling parameters, Platt calibration parameters and prespecified screening threshold. These values must not be re-estimated in the deployment cohort.

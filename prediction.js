(function (global) {
  "use strict";

  function clipProbability(value) {
    return Math.min(Math.max(value, 1e-6), 1 - 1e-6);
  }

  function logistic(value) {
    if (value >= 0) {
      const z = Math.exp(-value);
      return 1 / (1 + z);
    }
    const z = Math.exp(value);
    return z / (1 + z);
  }

  function logit(value) {
    const probability = clipProbability(value);
    return Math.log(probability / (1 - probability));
  }

  function calculateGLM7(values) {
    if (!Number.isInteger(values.age) || values.age < 45 || values.age > 120) {
      throw new Error("This research model applies to adults aged 45 years and older. Enter age in whole years (45–120).");
    }
    ["bmi", "fbg", "insulin", "tg", "ldl", "hdl"].forEach(function (name) {
      if (!Number.isFinite(values[name]) || values[name] <= 0) {
        throw new Error("All GLM7 component values must be greater than zero.");
      }
    });
    const modelAge = Math.min(values.age, 80);
    const numerator = modelAge * values.bmi * values.fbg * values.insulin *
      values.tg * values.ldl;
    const ratio = numerator / values.hdl;
    if (!Number.isFinite(ratio) || ratio <= 0) {
      throw new Error("All GLM7 component values must be greater than zero.");
    }
    return Math.log10(ratio);
  }

  function calibrateRawProbability(meanRawProbability, modelData) {
    return clipProbability(logistic(
      modelData.platt.intercept + modelData.platt.slope * logit(meanRawProbability)
    ));
  }

  function predictProbability(featureValues, modelData) {
    if (!modelData || !Array.isArray(modelData.models) || modelData.models.length !== 20) {
      throw new Error("The frozen model bundle is unavailable or incomplete.");
    }
    if (featureValues.length !== modelData.predictors.length) {
      throw new Error("The predictor vector does not match the frozen model.");
    }
    if (!featureValues.every(Number.isFinite)) {
      throw new Error("Every predictor requires a finite numeric value.");
    }
    modelData.predictors.forEach(function (name, index) {
      const value = featureValues[index];
      if (name === "Family_size" && (!Number.isInteger(value) || value < 1 || value > 7)) {
        throw new Error("Family size must be a whole number from 1 to 7 (7 represents 7 or more).");
      }
      if (name !== "GLM7" && name !== "Family_size" && value !== 0 && value !== 1) {
        throw new Error("Binary predictors must be coded as 0 or 1.");
      }
    });

    let rawProbabilitySum = 0;
    modelData.models.forEach(function (model) {
      const x = featureValues.slice();
      if (model.beta.length !== x.length || model.center.length !== x.length || model.scale.length !== x.length) {
        throw new Error("The frozen model coefficients or scaling parameters are incomplete.");
      }
      for (let i = 0; i < x.length; i += 1) {
        if (!Number.isFinite(model.scale[i]) || model.scale[i] <= 0) {
          throw new Error("The frozen model contains an invalid scaling parameter.");
        }
        x[i] = (x[i] - model.center[i]) / model.scale[i];
      }

      let linearPredictor = model.intercept;
      for (let i = 0; i < model.beta.length; i += 1) {
        linearPredictor += model.beta[i] * x[i];
      }
      rawProbabilitySum += clipProbability(logistic(linearPredictor));
    });

    const meanRawProbability = rawProbabilitySum / modelData.models.length;
    const calibratedProbability = calibrateRawProbability(meanRawProbability, modelData);

    return {
      rawProbability: meanRawProbability,
      probability: calibratedProbability,
      aboveThreshold: calibratedProbability >= modelData.threshold
    };
  }

  global.GLM7Prediction = {
    calculateGLM7: calculateGLM7,
    calibrateRawProbability: calibrateRawProbability,
    predictProbability: predictProbability
  };
}(typeof window !== "undefined" ? window : globalThis));

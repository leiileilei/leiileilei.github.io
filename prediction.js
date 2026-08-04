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
    const numerator = values.age * values.bmi * values.fbg * values.insulin *
      values.tg * values.ldl;
    const ratio = numerator / values.hdl;
    if (!Number.isFinite(ratio) || ratio <= 0) {
      throw new Error("All GLM7 component values must be greater than zero.");
    }
    return Math.log10(ratio);
  }

  function predictProbability(featureValues, modelData) {
    if (!modelData || !Array.isArray(modelData.models) || modelData.models.length !== 20) {
      throw new Error("The frozen model bundle is unavailable or incomplete.");
    }
    if (featureValues.length !== modelData.predictors.length) {
      throw new Error("The predictor vector does not match the frozen model.");
    }

    let rawProbabilitySum = 0;
    modelData.models.forEach(function (model) {
      const x = featureValues.slice();
      x[0] = (x[0] - model.center[0]) / model.scale[0];
      x[4] = (x[4] - model.center[1]) / model.scale[1];

      let linearPredictor = model.intercept;
      for (let i = 0; i < model.beta.length; i += 1) {
        linearPredictor += model.beta[i] * x[i];
      }
      rawProbabilitySum += clipProbability(logistic(linearPredictor));
    });

    const meanRawProbability = rawProbabilitySum / modelData.models.length;
    const calibratedProbability = clipProbability(logistic(
      modelData.platt.intercept + modelData.platt.slope * logit(meanRawProbability)
    ));

    return {
      rawProbability: meanRawProbability,
      probability: calibratedProbability,
      aboveThreshold: calibratedProbability >= modelData.threshold
    };
  }

  global.GLM7Prediction = {
    calculateGLM7: calculateGLM7,
    predictProbability: predictProbability
  };
}(typeof window !== "undefined" ? window : globalThis));

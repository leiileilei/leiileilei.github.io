(function () {
  "use strict";

  const form = document.getElementById("risk-form");
  const errorBox = document.getElementById("form-error");
  const model = window.GLM7_MODEL;
  const thresholdPercent = model.threshold * 100;

  function numberValue(id) {
    return Number(document.getElementById(id).value);
  }

  function collectGLM7Components() {
    return {
      age: numberValue("age"),
      bmi: numberValue("bmi"),
      fbg: numberValue("fbg"),
      insulin: numberValue("insulin"),
      tg: numberValue("tg"),
      ldl: numberValue("ldl"),
      hdl: numberValue("hdl")
    };
  }

  function collectPredictors(glm7) {
    return [
      glm7,
      numberValue("gender"),
      numberValue("education"),
      numberValue("marital"),
      numberValue("family-size"),
      numberValue("smoke"),
      numberValue("drink"),
      numberValue("hypertension"),
      numberValue("diabetes"),
      numberValue("physical-activity")
    ];
  }

  function validateForm() {
    if (!form.checkValidity()) {
      form.reportValidity();
      throw new Error("Please correct the highlighted values before calculating.");
    }
    const numericFields = form.querySelectorAll("input[type='number'], select");
    numericFields.forEach(function (field) {
      if (!Number.isFinite(Number(field.value))) {
        throw new Error("Every field requires a valid numeric value.");
      }
    });
  }

  function updateGLM7Preview() {
    try {
      const glm7 = window.GLM7Prediction.calculateGLM7(collectGLM7Components());
      document.getElementById("glm7-value").textContent = "GLM7 " + glm7.toFixed(2);
      return glm7;
    } catch (error) {
      document.getElementById("glm7-value").textContent = "GLM7 —";
      return null;
    }
  }

  function renderResult(glm7, result) {
    const percent = result.probability * 100;
    const ringDegrees = Math.max(0, Math.min(360, result.probability * 360));
    const classification = document.getElementById("classification");
    const supportStatus = document.getElementById("support-status");
    const outsideSupport = glm7 < model.glm7Support.trainingMin ||
      glm7 > model.glm7Support.trainingMax;

    document.getElementById("probability-value").textContent = percent.toFixed(1) + "%";
    document.getElementById("probability-ring").style.setProperty("--probability", ringDegrees + "deg");
    document.getElementById("summary-glm7").textContent = glm7.toFixed(3);
    document.getElementById("probability-marker").style.left = Math.min(percent, 100) + "%";

    classification.className = "classification " + (result.aboveThreshold ? "above" : "below");
    classification.textContent = result.aboveThreshold
      ? "High-risk"
      : "Low-risk";

    supportStatus.className = "support-status " + (outsideSupport ? "outside" : "");
    supportStatus.textContent = outsideSupport ? "Outside GLM7 training range" : "Within model range";
  }

  function calculate(event) {
    if (event) event.preventDefault();
    errorBox.hidden = true;
    try {
      validateForm();
      const glm7 = window.GLM7Prediction.calculateGLM7(collectGLM7Components());
      const result = window.GLM7Prediction.predictProbability(collectPredictors(glm7), model);
      renderResult(glm7, result);
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.hidden = false;
    }
  }

  document.getElementById("threshold-value").textContent = thresholdPercent.toFixed(1) + "%";
  document.getElementById("threshold-marker").style.left = thresholdPercent + "%";
  form.addEventListener("input", updateGLM7Preview);
  form.addEventListener("submit", calculate);
  document.getElementById("reset-button").addEventListener("click", function () {
    form.reset();
    updateGLM7Preview();
    calculate();
  });

  updateGLM7Preview();
  calculate();
}());

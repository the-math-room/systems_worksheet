/* global jsyaml */

/**
 * Worksheet loading and validation.
 *
 * This file is intentionally small: it fetches YAML, parses it, and performs
 * lightweight shape validation before handing data to the renderer.
 */

const DEFAULT_WORKSHEET_PATH = "assets/worksheets/systems-linear-equations.yaml";

async function loadWorksheet(path = DEFAULT_WORKSHEET_PATH) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Could not load worksheet at ${path}: ${response.status} ${response.statusText}`);
  }

  const yamlText = await response.text();
  const data = jsyaml.load(yamlText);
  validateWorksheet(data);
  return Object.freeze(data);
}

function validateWorksheet(data) {
  const requiredTopLevelFields = [
    "title",
    "subtitle",
    "goal",
    "methodClues",
    "methodRecognition",
    "eliminationGuided",
    "eliminationPractice",
    "substitutionGuided",
    "substitutionPractice",
    "solutionRules",
    "solutionCount",
    "exitTicket",
  ];

  requiredTopLevelFields.forEach((field) => {
    if (!(field in data)) {
      throw new Error(`Worksheet is missing required field: ${field}`);
    }
  });

  validateProblemList(data.methodRecognition, "methodRecognition");
  validateProblemList(data.eliminationGuided, "eliminationGuided");
  validateProblemList(data.eliminationPractice, "eliminationPractice");
  validateProblemList(data.substitutionGuided, "substitutionGuided");
  validateProblemList(data.substitutionPractice, "substitutionPractice");
  validateProblemList(data.solutionCount, "solutionCount");
}

function validateProblemList(problems, fieldName) {
  if (!Array.isArray(problems)) {
    throw new Error(`${fieldName} must be a list.`);
  }

  problems.forEach((problem, index) => {
    if (problem.id === undefined) {
      throw new Error(`${fieldName}[${index}] is missing an id.`);
    }
  });
}

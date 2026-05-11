/* global jsyaml */

/**
 * Worksheet loading and validation.
 *
 * This file fetches YAML, parses it, and performs lightweight shape validation
 * before handing data to the renderer.
 *
 * Important for GitHub Pages:
 * All default paths are resolved relative to document.baseURI, so this works
 * both locally and at https://username.github.io/repo-name/.
 */

const DEFAULT_WORKSHEET_PATH = "./assets/worksheets/systems-linear-equations.yaml";

function resolveSiteUrl(path) {
  return new URL(path, document.baseURI);
}

async function loadWorksheet(path = DEFAULT_WORKSHEET_PATH) {
  const worksheetUrl = resolveSiteUrl(path);
  const response = await fetch(worksheetUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Could not load worksheet at ${worksheetUrl.href}: ${response.status} ${response.statusText}`
    );
  }

  const yamlText = await response.text();

  let data;
  try {
    data = jsyaml.load(yamlText);
  } catch (error) {
    throw new Error(`YAML parse error: ${error.message}`);
  }

  validateWorksheet(data);
  return Object.freeze(data);
}

function validateWorksheet(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Worksheet YAML must contain a top-level object.");
  }

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

  validateList(data.methodClues, "methodClues");
  validateProblemList(data.methodRecognition, "methodRecognition");
  validateProblemList(data.eliminationGuided, "eliminationGuided");
  validateProblemList(data.eliminationPractice, "eliminationPractice");
  validateProblemList(data.substitutionGuided, "substitutionGuided");
  validateProblemList(data.substitutionPractice, "substitutionPractice");
  validateProblemList(data.solutionCount, "solutionCount");
  validateList(data.solutionRules, "solutionRules");
  validateList(data.exitTicket, "exitTicket");
}

function validateList(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be a list.`);
  }
}

function validateProblemList(problems, fieldName) {
  validateList(problems, fieldName);

  problems.forEach((problem, index) => {
    if (!problem || typeof problem !== "object") {
      throw new Error(`${fieldName}[${index}] must be an object.`);
    }

    if (problem.id === undefined) {
      throw new Error(`${fieldName}[${index}] is missing an id.`);
    }
  });
}
/**
 * Tiny worksheet smoke-check.
 *
 * This is intentionally not a schema validator.
 * It only catches mistakes that would make the whole worksheet fail to render.
 */

export function validateWorksheet(data) {
  if (!isObject(data)) {
    throw new Error("Worksheet YAML must be an object.");
  }

  if (!isObject(data.content)) {
    throw new Error("Worksheet is missing content object.");
  }

  if (!Array.isArray(data.pages)) {
    throw new Error("Worksheet is missing pages list.");
  }

  data.pages.forEach((page, pageIndex) => {
    if (!Array.isArray(page?.sections)) {
      throw new Error(`pages[${pageIndex}] is missing sections list.`);
    }

    page.sections.forEach((section, sectionIndex) => {
      const path = `pages[${pageIndex}].sections[${sectionIndex}]`;

      if (!section?.type) {
        throw new Error(`${path} is missing type.`);
      }

      if (section.source && !(section.source in data.content)) {
        throw new Error(`${path}.source not found in content: ${section.source}`);
      }

      if (section.rulesSource && !(section.rulesSource in data.content)) {
        throw new Error(`${path}.rulesSource not found in content: ${section.rulesSource}`);
      }
    });
  });
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
/**
 * Converts a verified G-MAD JSON architecture object into PlantUML syntax.
 * @param {Object} architectureJson - The JSON output from the AI debate.
 * @returns {string} - Formatted PlantUML syntax.
 */
export const generatePlantUmlString = (architectureJson) => {
  if (!architectureJson || !architectureJson.components) {
    return "Error: Invalid architecture data provided.";
  }

  let uml = "@startuml\n";
  uml += "!theme lightgray\n"; 
  uml += `title ${architectureJson.systemName || "System Architecture"}\n\n`;

  // Define components
  uml += "package \"System Components\" {\n";
  architectureJson.components.forEach((comp) => {
    uml += `  component "${comp.name}" as ${comp.id}\n`;
  });
  uml += "}\n\n";

  // Define relationships
  if (architectureJson.relationships) {
    architectureJson.relationships.forEach((rel) => {
      uml += `${rel.source} --> ${rel.target} : "${rel.description}"\n`;
    });
  }

  uml += "\n@enduml";
  
  return uml;
};

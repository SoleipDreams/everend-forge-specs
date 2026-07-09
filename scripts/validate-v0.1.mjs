import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";

const root = process.cwd();
const schemaDir = path.join(root, "schemas", "v0.1");
const demoVaultDir = path.join(root, "examples", "demo-vault");
const invalidDir = path.join(root, "examples", "invalid-v0.1");

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  strictRequired: false,
});

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readYaml(relativePath) {
  return YAML.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readSchema(name) {
  return JSON.parse(fs.readFileSync(path.join(schemaDir, name), "utf8"));
}

function markdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...markdownFiles(fullPath));
    } else if (entry.name.endsWith(".md") && entry.name !== "README.md") {
      // Exclude folder description files (e.g., Characters/Characters.md)
      const parentDirName = path.basename(path.dirname(fullPath));
      const isFolderDescription = entry.name === `${parentDirName}.md`;
      if (!isFolderDescription) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function parseFrontmatter(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  if (!text.startsWith("---\n")) {
    throw new Error(
      `${path.relative(root, filePath)} is missing YAML frontmatter`,
    );
  }

  const end = text.indexOf("\n---", 4);
  if (end === -1) {
    throw new Error(
      `${path.relative(root, filePath)} has unterminated YAML frontmatter`,
    );
  }

  return YAML.parse(text.slice(4, end));
}

function formatErrors(validate) {
  return ajv.errorsText(validate.errors, { separator: "\n" });
}

function expectValid(validate, value, label) {
  if (!validate(value)) {
    throw new Error(`${label} should be valid:\n${formatErrors(validate)}`);
  }
}

function expectInvalid(validate, value, label) {
  if (validate(value)) {
    throw new Error(`${label} should be invalid`);
  }
}

const entitySchema = readSchema("entity-frontmatter.schema.json");
const taxonomySchema = readSchema("taxonomy.schema.json");
const runtimeSchema = readSchema("runtime-package.schema.json");
const reportSchema = readSchema("validation-report.schema.json");
const changeSetSchema = readSchema("canon-change-set.schema.json");
const compendiumConfigSchema = readSchema("compendium-config.schema.json");

const validateEntity = ajv.compile(entitySchema);
const validateTaxonomy = ajv.compile(taxonomySchema);
const validateRuntime = ajv.compile(runtimeSchema);
const validateReport = ajv.compile(reportSchema);
const validateChangeSet = ajv.compile(changeSetSchema);
const validateCompendiumConfig = ajv.compile(compendiumConfigSchema);

for (const file of markdownFiles(demoVaultDir)) {
  expectValid(
    validateEntity,
    parseFrontmatter(file),
    path.relative(root, file),
  );
}

expectValid(
  validateTaxonomy,
  readYaml("examples/demo-vault/.everend/taxonomy.yaml"),
  "examples/demo-vault/.everend/taxonomy.yaml",
);

expectValid(
  validateRuntime,
  readJson("examples/runtime-package.json"),
  "examples/runtime-package.json",
);

expectValid(
  validateRuntime,
  readYaml("examples/runtime-package.yaml"),
  "examples/runtime-package.yaml",
);

expectValid(
  validateChangeSet,
  readJson("examples/canon-change-set.json"),
  "examples/canon-change-set.json",
);

expectValid(
  validateCompendiumConfig,
  readYaml("examples/demo-vault/.everend/compendium.yaml"),
  "examples/demo-vault/.everend/compendium.yaml",
);

expectInvalid(
  validateEntity,
  parseFrontmatter(path.join(invalidDir, "missing-id.md")),
  "examples/invalid-v0.1/missing-id.md",
);

expectInvalid(
  validateEntity,
  parseFrontmatter(path.join(invalidDir, "invalid-childrenids.md")),
  "examples/invalid-v0.1/invalid-childrenids.md",
);

expectInvalid(
  validateTaxonomy,
  readYaml("examples/invalid-v0.1/invalid-taxonomy.yaml"),
  "examples/invalid-v0.1/invalid-taxonomy.yaml",
);

expectInvalid(
  validateRuntime,
  readJson("examples/invalid-v0.1/invalid-runtime-package.json"),
  "examples/invalid-v0.1/invalid-runtime-package.json",
);

expectInvalid(
  validateReport,
  readYaml("examples/invalid-v0.1/invalid-validation-report.yaml"),
  "examples/invalid-v0.1/invalid-validation-report.yaml",
);

expectInvalid(
  validateChangeSet,
  readJson("examples/invalid-v0.1/invalid-canon-change-set.json"),
  "examples/invalid-v0.1/invalid-canon-change-set.json",
);

expectInvalid(
  validateCompendiumConfig,
  readYaml("examples/invalid-v0.1/invalid-compendium-config.yaml"),
  "examples/invalid-v0.1/invalid-compendium-config.yaml",
);

console.log("Everend Spec v0.1 validation passed");

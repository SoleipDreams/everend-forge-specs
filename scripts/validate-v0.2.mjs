import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";

const root = process.cwd();
const schema = JSON.parse(
  fs.readFileSync(path.join(root, "schemas/v0.2/properties-config.schema.json"), "utf8"),
);
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
const validateSchema = ajv.compile(schema);
const validateUniverseProfile = ajv.compile(readSchema("schemas/v0.2/universe-profile.schema.json"));
const validateRuntimePackage = ajv.compile(readSchema("schemas/v0.2/runtime-package.schema.json"));

function readSchema(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readMarkdownFrontmatter(relativePath) {
  const markdown = fs.readFileSync(path.join(root, relativePath), "utf8");
  const closingFence = markdown.indexOf("\n---", 4);
  if (!markdown.startsWith("---\n") || closingFence === -1) {
    throw new Error(`${relativePath} must have YAML frontmatter`);
  }
  return { markdown, frontmatter: YAML.parse(markdown.slice(4, closingFence)) ?? {} };
}

function variantErrors(markdown, frontmatter) {
  const errors = [];
  const variants = frontmatter.variants;
  if (!variants || typeof variants !== "object" || Array.isArray(variants)) return errors;
  const labels = new Set();
  if (!variants.base || typeof variants.base.label !== "string" || !variants.base.label.trim()) {
    errors.push("variants.base must have a non-empty label");
  }
  for (const [id, variant] of Object.entries(variants)) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) errors.push(`invalid variant id ${id}`);
    if (
      !variant ||
      typeof variant !== "object" ||
      Array.isArray(variant) ||
      typeof variant.label !== "string" ||
      !variant.label.trim()
    ) {
      errors.push(`${id} must have a non-empty label`);
      continue;
    }
    const label = variant.label.toLocaleLowerCase();
    if (labels.has(label)) errors.push(`duplicate variant label ${variant.label}`);
    labels.add(label);
    if (id === "base" && variant.overrides) errors.push("base must not define overrides");
    if (variant.overrides && typeof variant.overrides === "object") {
      for (const key of ["id", "type", "variants"]) {
        if (key in variant.overrides) errors.push(`${id} must not override ${key}`);
      }
    }
  }
  const open = /<!--\s*everend:variant\s+id=(?:"([A-Za-z0-9][A-Za-z0-9._-]*)"|'([A-Za-z0-9][A-Za-z0-9._-]*)')\s*-->/g;
  const close = /<!--\s*\/everend:variant\s*-->/g;
  let match;
  while ((match = open.exec(markdown))) {
    const id = match[1] ?? match[2];
    close.lastIndex = open.lastIndex;
    const end = close.exec(markdown);
    if (!end) {
      errors.push(`${id} block is not closed`);
      break;
    }
    if (!variants[id]) errors.push(`${id} block references an unknown variant`);
    open.lastIndex = end.index + end[0].length;
  }
  return errors;
}

function expectValidVariant(relativePath) {
  const { markdown, frontmatter } = readMarkdownFrontmatter(relativePath);
  const errors = variantErrors(markdown, frontmatter);
  if (errors.length) throw new Error(`${relativePath} should be valid:\n${errors.join("\n")}`);
}

function expectInvalidVariant(relativePath) {
  const { markdown, frontmatter } = readMarkdownFrontmatter(relativePath);
  if (!variantErrors(markdown, frontmatter).length) throw new Error(`${relativePath} should be invalid`);
}

function flatten(definitions, parentScope, results = []) {
  for (const definition of definitions ?? []) {
    const effectiveScope = definition.appliesTo ?? parentScope;
    results.push({ definition, effectiveScope, parentScope });
    flatten(definition.children, effectiveScope, results);
  }
  return results;
}

function semanticErrors(config) {
  const errors = [];
  const allTypes = config.entityTypes.definitions.map((definition) => definition.id);
  const nodes = flatten(
    [...(config.baseProperties?.definitions ?? []), ...(config.customFields?.definitions ?? [])],
    allTypes,
  );
  const ids = new Set();
  for (const { definition, effectiveScope, parentScope } of nodes) {
    if (ids.has(definition.id)) errors.push(`Duplicate property ID: ${definition.id}`);
    ids.add(definition.id);
    if (definition.visibleWhen?.type) {
      errors.push(`${definition.id} must use appliesTo instead of visibleWhen.type`);
    }
    if (
      definition.appliesTo &&
      parentScope &&
      definition.appliesTo.some((type) => !parentScope.includes(type))
    ) {
      errors.push(`${definition.id} scope must be a subset of its parent scope`);
    }
    if (effectiveScope?.some((type) => !allTypes.includes(type))) {
      errors.push(`${definition.id} references an unknown entity type`);
    }
  }
  for (const { definition } of nodes) {
    for (const dependencyId of Object.keys(definition.visibleWhen ?? {})) {
      if (!ids.has(dependencyId)) {
        errors.push(`${definition.id} references missing dependency ${dependencyId}`);
      }
    }
  }
  const propertiesById = new Map(nodes.map((node) => [node.definition.id, node]));
  for (const type of config.entityTypes.definitions) {
    for (const [role, propertyId] of Object.entries(type.presentation ?? {})) {
      const property = propertiesById.get(propertyId);
      if (!property) {
        errors.push(`${type.id} ${role} references missing property ${propertyId}`);
      } else if (property.definition.type !== "image") {
        errors.push(`${type.id} ${role} must reference an image property`);
      } else if (!property.effectiveScope.includes(type.id)) {
        errors.push(`${type.id} ${role} must reference a property in its type scope`);
      }
    }
  }
  return errors;
}

function expectValid(config, label) {
  if (!validateSchema(config)) {
    throw new Error(`${label} should match the schema:\n${ajv.errorsText(validateSchema.errors)}`);
  }
  const errors = semanticErrors(config);
  if (errors.length) throw new Error(`${label} should be semantically valid:\n${errors.join("\n")}`);
}

function expectInvalid(config, label) {
  if (!validateSchema(config)) return;
  if (semanticErrors(config).length === 0) throw new Error(`${label} should be invalid`);
}

const validConfig = readJson("examples/v0.2/properties.json");
expectValid(validConfig, "examples/v0.2/properties.json");
if (!validateUniverseProfile(readJson("examples/v0.2/universe.json"))) {
  throw new Error(`examples/v0.2/universe.json should match the schema:\n${ajv.errorsText(validateUniverseProfile.errors)}`);
}
if (!validateRuntimePackage(readJson("examples/v0.2/runtime-package.json"))) {
  throw new Error(`examples/v0.2/runtime-package.json should match the schema:\n${ajv.errorsText(validateRuntimePackage.errors)}`);
}
if (validateRuntimePackage(readJson("examples/invalid-v0.2/invalid-runtime-logic.json"))) {
  throw new Error("examples/invalid-v0.2/invalid-runtime-logic.json should reject logic on a flow transition");
}

const nestedMarkdown = fs.readFileSync(path.join(root, "examples/v0.2/nested-character.md"), "utf8");
const closingFence = nestedMarkdown.indexOf("\n---", 4);
const nestedFrontmatter = YAML.parse(nestedMarkdown.slice(4, closingFence));
if (nestedFrontmatter.identity?.profile?.age !== 34 || "role" in nestedFrontmatter) {
  throw new Error("nested-character.md must keep group children nested");
}

expectValidVariant("examples/v0.2/variant-character.md");
["variant-unknown.md", "variant-unclosed.md", "variant-structural.md"].forEach((name) =>
  expectInvalidVariant(`examples/invalid-v0.2/${name}`),
);

for (const name of [
  "duplicate-property-id.json",
  "broken-condition.json",
  "type-condition.json",
  "invalid-child-scope.json",
  "invalid-presentation.json",
]) {
  expectInvalid(readJson(`examples/invalid-v0.2/${name}`), `examples/invalid-v0.2/${name}`);
}

console.log("Everend Spec v0.2 validation passed");

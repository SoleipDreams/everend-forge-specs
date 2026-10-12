import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

const root = process.cwd();
const schemaRoot = path.join(root, "schemas", "sync", "v0.1");
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
const sync = ajv.compile(readJson(path.join(schemaRoot, "sync-message.schema.json")));
const bundle = ajv.compile(readJson(path.join(schemaRoot, "offline-bundle-manifest.schema.json")));
const errors = (validator) => ajv.errorsText(validator.errors, { separator: "\n" });

const validMessage = readJson(path.join(root, "examples", "sync-message.json"));
if (!sync(validMessage)) throw new Error(`sync-message.json should be valid:\n${errors(sync)}`);

const validBundle = readJson(path.join(root, "examples", "offline-bundle-manifest.json"));
if (!bundle(validBundle)) throw new Error(`offline-bundle-manifest.json should be valid:\n${errors(bundle)}`);

const invalidMessage = readJson(path.join(root, "examples", "invalid-sync-message.json"));
if (sync(invalidMessage)) throw new Error("invalid-sync-message.json should be invalid");

console.log("Everend Sync Spec v0.1 validation passed");

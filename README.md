# Everend Spec

Everend Spec defines the portable contracts shared by Everend Forge tools. It is the technical source of compatibility for vaults, branching graphs, runtime packages, and validation reports.

This repository starts with human-readable Markdown contracts, JSON Schema, and examples. A CLI validator can be added after the first workflows are validated.

## Start Here

- [SPEC-V0.1.md](SPEC-V0.1.md): first human-readable contract.
- [docs/vault-format.md](docs/vault-format.md): Markdown vault expectations.
- [docs/runtime-package.md](docs/runtime-package.md): JSON/YAML runtime package expectations.
- [docs/validation-report.md](docs/validation-report.md): shared validation report concept.
- [docs/change-sets.md](docs/change-sets.md): portable canon-edit review workflow.
- [docs/compendium.md](docs/compendium.md): public Compendium configuration and PathBranching reader boundary.
- [schemas/v0.1](schemas/v0.1): JSON Schemas for the v0.1 contracts.
- [examples/demo-vault](examples/demo-vault): synthetic Markdown vault example.
- [examples/runtime-package.json](examples/runtime-package.json): JSON runtime package example.
- [examples/runtime-package.yaml](examples/runtime-package.yaml): YAML runtime package example.
- [examples/canon-change-set.json](examples/canon-change-set.json): cross-app canon change proposal.
- [examples/demo-vault/.everend/compendium.yaml](examples/demo-vault/.everend/compendium.yaml): Compendium configuration example.
- [examples/invalid-v0.1](examples/invalid-v0.1): deliberately invalid fixtures for validator tests.

## Design Goals

- Keep canon portable and readable in Markdown tools.
- Keep runtime packages executable without authoring apps installed.
- Use stable IDs for cross-tool references.
- Support project-specific taxonomy while keeping files portable.
- Let apps evolve independently while targeting explicit spec versions.

## Validation

~~~bash
npm install
npm test
~~~

The validation script checks the v0.1 JSON Schemas against the canonical demo vault, runtime package examples, and deliberately invalid fixtures.

## License

Spec prose and examples are licensed under CC BY 4.0. Any code added later should use MIT OR Apache-2.0 unless stated otherwise.

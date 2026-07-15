# Compendium

Everend Compendium creates a static, public reading experience from an Everend vault. It is a read-only projection: Markdown canon remains the source of truth and PathBranching remains the source of narrative authoring data.

## Configuration

The optional `.everend/compendium.yaml` file follows `schemas/v0.1/compendium-config.schema.json`.

`publication.statuses` defaults to `[canon]` when the file or property is absent. The desktop reader exposes these statuses under Universe settings, so you can publish all entries marked `canon` and optionally include other statuses. `narrative.mode` defaults to `scenes-and-relations` and is the only v0.1 mode.

The site can set a title, description, locale, cover image, logo, visual preset, accent color, and entity-type navigation order. Asset paths are always vault-relative and may not escape the vault.

## Narrative reader boundary

The v0.1 reader supports PathBranching's modular workspace (`.everend/.pathbranching/manifest.json` plus story files) and legacy `.pathbranching.json` stories. It may project story names, sequences, event names, descriptions, text, and canon references.

It must not publish graph layout, choices, outcomes, conditions, consequences, variables, external functions, engine targets, or authoring metadata. A broken story is a non-fatal build warning.

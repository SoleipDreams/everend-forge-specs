# Compendium

Everend Compendium creates a local reading experience and static publication from an Everend vault. It is a read-only projection: WorldNotion owns canon Markdown and PathBranching owns narrative authoring data. Product milestones 1.0–3.0 are Compendium milestones and remain separate from Forge 0.5 and package versions.

## Configuration

The optional `.everend/.compendium/settings.json` file (JSON format) follows `schemas/v0.1/compendium-config.schema.json`.

`publication.statuses` defaults to `["canon"]` when the file or property is absent. The desktop reader exposes these statuses under Universe settings, so you can publish all entries marked `canon` and optionally include other statuses. `narrative.mode` defaults to `scenes-and-relations` and is the only v0.1 mode.

The site can set a title, description, locale, cover image, logo, visual preset, accent color, and entity-type navigation order. Asset paths are always vault-relative and may not escape the vault.

## Narrative reader boundary

The reader supports PathBranching's modular workspace (`.everend/.pathbranching/manifest.json` plus story files) and legacy `.pathbranching.json` stories. It may project story names, sequences, event names, descriptions, text, canon references and simple narrative choices.

A projected choice has only an opaque identifier, visible label, destination event identifier, destination route and destination display name. Compendium may construct it from a visible PathBranching outcome or an explicitly labelled route. It must omit condition expressions, variables, consequences, outcomes as executable data, graph layout, external functions, engine targets and authoring metadata. It must never imply that the reader evaluates story rules.

If a route is conditional, depends on decision/outcome availability, or uses a fallback rule, Compendium reports a generic diagnostic and does not present it as unconditional. A missing destination is diagnosed and omitted. A publication profile that excludes a choice destination removes that choice and records a publication diagnostic. Diagnostics do not include the condition expression or runtime values. A broken source story remains a non-fatal build warning, consistent with the existing reader contract.

Static output and local reading use the same projection. Profile filtering must happen before choices are rendered so a link cannot reveal an excluded event. GM and player editions are separate profile builds; static pages do not provide account-based role access.

## Product direction

- **1.0 — Integral wiki:** local consultation of Everend sources, publication profiles, and manually selectable narrative paths without rule simulation.
- **2.0 — Role editions:** separate GM and player editions, each previewed and exported as its own site or package.
- **3.0 — Editorial assembly:** order references to WorldNotion Markdown and PathBranching text, select a route per edition, and optionally add canon references as notes or an appendix. Compendium never edits source manuscripts.

The initial 3.0 output family is EPUB 3.3, DOCX and PDF for books/novels; Fountain and PDF for audiovisual scripts; and template-based PDF/DOCX for theatre. EPUB includes accessibility metadata and validation. Print PDF profiles are configurable and do not promise compatibility with every publisher. This is a bounded family, not a promise of arbitrary formats.

### Versioned editorial profiles

The planned profile location is `.everend/.compendium/editorial/<profile-id>.json`. Each profile declares `profileVersion: 1` and stores only references and preferences:

```json
{
  "profileVersion": 1,
  "id": "northwatch-novel",
  "name": "Northwatch novel",
  "sources": [
    {
      "app": "worldnotion",
      "sourceId": "location:northwatch",
      "path": "Places/Northwatch.md",
      "order": 1
    },
    {
      "app": "pathbranching",
      "sourceId": "main",
      "path": ".everend/.pathbranching/stories/main/story.json",
      "order": 2
    }
  ],
  "routes": [
    { "storyId": "main", "eventIds": ["event:arrival", "event:departure"] }
  ],
  "references": { "mode": "appendix" },
  "output": {
    "kind": "book",
    "format": "epub-3.3",
    "templateId": "novel-compact"
  }
}
```

`sources` locates owner data; it never embeds Markdown, story text, or copied canon. `routes` selects one explicit event path per edition and does not request rule evaluation. `references.mode` is `none`, `endnotes`, or `appendix`. `output.format` is limited to `epub-3.3`, `docx`, `pdf-reading`, `pdf-print`, `fountain`, `template-pdf`, or `template-docx`. The referenced files and every selected route destination must resolve before export; an invalid profile must surface an error rather than produce a silently incomplete edition. These profile fields describe the 3.0 target and are not part of the current `settings.json` config schema.

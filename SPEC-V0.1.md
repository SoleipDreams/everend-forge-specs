# Everend Spec v0.1

Everend Spec v0.1 is the first human-readable contract for the Everend Forge ecosystem. It defines the concepts that WorldNotion, PathBranching, and engine plugins must share.

This version is intentionally lightweight: Markdown contracts, JSON Schema, and examples. A CLI validator, formal compatibility matrix, and migration tooling are later milestones.

## Vault

A vault is a local folder containing Markdown files, optional assets, and optional Everend metadata. It is the canonical source for worldbuilding and narrative planning content.

A vault should remain readable in Obsidian-compatible tools and should not depend on app-private storage.

An Everend-compatible vault may include `.everend/taxonomy.yaml` to describe project-specific entity types and properties. This manifest is optional; tools must still read Markdown files when it is absent.

## Entity

An entity is a Markdown file representing a canon or planning unit such as a character, location, organization, event, concept, item, world, cycle, universe, story, arc, scene, or quest.

Entity files use YAML frontmatter plus Markdown body content.

## Frontmatter

Minimum recommended fields:

~~~yaml
---
id: example-character
type: character
name: Example Character
status: canon
---
~~~

Field meanings:

- id: stable identifier used by tools and runtime packages.
- type: entity kind. This is an open string, not a closed enum.
- name: human-readable display name.
- status: canon, proposal, draft, deprecated, or a project-defined equivalent.

Common optional fields:

- tags: list of labels for search and grouping.
- aliases: alternate names that tools may use for display or wikilink resolution.
- parentId: stable ID of a parent entity.
- childrenIds: stable IDs of child entities when the author wants to declare them explicitly.

Tools must preserve unknown frontmatter fields when editing files. Project-specific properties are first-class metadata, not invalid data.

## Recommended taxonomy

Everend Spec v0.1 recommends a hybrid worldbuilding and narrative planning taxonomy:

- character
- location
- organization
- event
- concept
- item
- world
- cycle
- universe
- story
- arc
- scene
- quest

Projects may define additional types such as relic, faction, spell, species, timeline-era, or manuscript-scene.

## Taxonomy manifest

A vault may define `.everend/taxonomy.yaml` to describe custom types and properties.

~~~yaml
specVersion: "0.1"
types:
  item:
    label: Item
    description: Portable object, relic, tool, artifact, or inventory-relevant entity.
    properties:
      rarity:
        type: select
        options: [common, rare, legendary]
      material:
        type: text
      relatedCharacters:
        type: entityRefList
~~~

Supported property types in v0.1:

- text
- number
- boolean
- date
- select
- multiSelect
- entityRef
- entityRefList

## Stable ID

The stable ID is the durable reference used across apps. File names and display names can change; IDs should remain stable.

## Hierarchy

Hierarchies use stable IDs in frontmatter. `parentId` points to one parent entity. `childrenIds` may list known child entities. Tools may infer missing reverse relationships, but should not rewrite files automatically unless the user explicitly asks.

## Wikilink

Wikilinks are Obsidian-compatible references inside Markdown content.

~~~md
Example Character is related to [[Example-Location]] and [[Example-Organization]].
~~~

## Backlink

A backlink is derived from wikilinks. If file A links to file B, tools may show A as a backlink of B.

## Branch graph

A branch graph is an interactive narrative graph produced by PathBranching. It may reference vault entities by stable ID, but it does not replace the vault.

WorldNotion may store worldbuilding and narrative planning entities such as story, arc, scene, and quest. PathBranching owns executable runtime flow such as nodes, choices, conditions, consequences, and branching state.

## Compendium configuration

A universe may include `.everend/compendium.yaml` to configure a read-only, publishable Compendium. The configuration controls site identity, visual presentation, navigation, publication filtering, and the editorial narrative projection. It never changes canon or PathBranching authoring data.

Compendium readers publish `canon` entities by default. A universe can explicitly publish additional status values. The v0.1 narrative mode is `scenes-and-relations`: readers may show story, sequence, event, text, description, and canon references, but must not expose choices, conditions, consequences, variables, graph layout, or other executable state.

~~~yaml
specVersion: "0.1"
site:
  title: Example Compendium
  description: A public guide to the example universe.
theme:
  preset: midnight
  accentColor: "#C89B3C"
publication:
  statuses: [canon]
narrative:
  mode: scenes-and-relations
~~~

PathBranching readers may consume the saved modular workspace under `.everend/.pathbranching/` and its legacy story files. They should treat it as a read-only source and only project the editorial fields listed above. Invalid or unsupported stories must produce a warning rather than block canon publication.

## Runtime package

A runtime package is a JSON/YAML export that engine plugins can execute without requiring authoring apps.

Runtime packages may include:

- specVersion.
- packageId.
- entryNodeId.
- canonRefs.
- variables.
- localization.
- nodes and choices.
- conditions.
- consequences.
- events.

## Validation report

A validation report is a shared concept for warnings and errors across tools.

Validation reports use `specVersion: "0.1"` and contain a list of findings.

~~~yaml
specVersion: "0.1"
tool: worldnotion
findings:
  - code: missing_required_field
    severity: error
    file: Characters/Example.md
    field: id
    message: Entity is missing required field id.
~~~

Common findings include:

- Missing required frontmatter.
- Missing required field.
- Duplicate IDs.
- Broken wikilinks.
- Missing canon references.
- Broken graph transitions.
- Missing runtime assets.

## Canon change set

A Canon Change Set is a portable, reviewable proposal to modify an existing vault entity. It lives in `.everend/changes/` and records the stable target ID/path, immutable base content, proposed content, optional diff, revision, timestamps, source app, and review state. Tools must not apply a change set automatically; direct application requires an explicit user action and a source-version conflict check.

## Later work

- CLI validator.
- Formal error codes.
- Version compatibility matrix.
- Migration rules between spec versions.
- Formula, rollup, computed field, and database view semantics.
